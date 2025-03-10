import axios from "axios";
import { Octokit } from "octokit";

import { db } from "@/server/db";

import { aiCommitSummary } from "./gemini";

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const githubUrl = `https://github.com/docker/genai-stack`;

type Response = {
    commitMessage: string;
    commitHash: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
};

export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error("Invalid GitHub URL provided");
    };
    const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo
    });

    const sortedCommits = data.sort((a: any, b: any) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()) as any[];

    return sortedCommits.slice(0, 10).map((commit: any) => ({
        commitHash: commit.sha ?? "",
        commitMessage: commit.commit?.message ?? "",
        commitAuthorName: commit.commit?.author?.name ?? "",
        commitAuthorAvatar: commit.author?.avatar_url ?? "",
        commitDate: commit.commit?.author?.date ?? "",
    }));
};

export const pollCommits = async (projectId: string) => {
    const { project, githubUrl } = await fetchProjectGithubURL(projectId);
    const commitHashes = await getCommitHashes(githubUrl);
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);
    const summaryResponses = await Promise.allSettled(unprocessedCommits.map(async (commit) => {
        return await summariseCommit(githubUrl, commit.commitHash);
    }));
    const summaries = summaryResponses.map((response) => response.status === "fulfilled" ? response.value as string : "No summary available due to an internal error");

    const commits = await db.commit.createMany({
        data: summaries.map((summary, index) => {
            console.log("Processing commit", index);
            return {
                projectId,
                commitHash: unprocessedCommits[index]?.commitHash ?? "",
                commitMessage: unprocessedCommits[index]?.commitMessage ?? "",
                commitAuthorName: unprocessedCommits[index]?.commitAuthorName ?? "",
                commitAuthorAvatar: unprocessedCommits[index]?.commitAuthorAvatar ?? "",
                commitDate: unprocessedCommits[index]?.commitDate ?? new Date().toISOString(),
                summary,
            }
        }),
    });
    return commits;
};

async function summariseCommit(githubUrl: string, commitHash: string) {
    const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
        headers: {
            Accept: "application/vnd.github.v3.diff",
        },
    });
    return await aiCommitSummary(data) || "No summary available due to an internal error";
};

async function fetchProjectGithubURL(projectId: string) {
    const project = await db.project.findUnique({
        where: {
            id: projectId,
        },
        select: {
            githubUrl: true,
        },
    });

    if (!project?.githubUrl) {
        throw new Error("Project does not have a linked GitHub repository");
    };

    return { project, githubUrl: project?.githubUrl };
};

async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
    const processedCommits = await db.commit.findMany({
        where: {
            projectId,
        },
    });

    const unprocessedCommits = commitHashes.filter((commit) => !processedCommits.some((processedCommit) => processedCommit.commitHash === commit.commitHash));
    return unprocessedCommits;
}

