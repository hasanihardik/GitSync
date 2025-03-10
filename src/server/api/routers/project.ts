import { z } from "zod";

import { pollCommits } from "@/lib/github";
import { checkCredits, indexGithubRepo } from "@/lib/github-loader";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const createProjectSchema = z.object({
    name: z.string().min(1),
    githubUrl: z.string(),
    githubToken: z.string().optional(),
})

export const projectRouter = createTRPCRouter({
    createProject: protectedProcedure
        .input(createProjectSchema)
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({
                where: {
                    id: ctx.user.userId!,
                },
                select: {
                    credits: true,
                },
            });

            if (!user) throw new Error("No user found");
            const currentCredits = user.credits || 0;
            const fileCount = await checkCredits(input.githubUrl, input.githubToken);

            if (currentCredits < fileCount) {
                throw new Error("Insufficient Credits");
            }

            const project = await ctx.db.project.create({
                data: {
                    name: input.name,
                    githubUrl: input.githubUrl,
                    userToProjects: {
                        create: {
                            userId: ctx.user.userId!,
                        }
                    }
                }
            })

            await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
            await pollCommits(project.id);
            await ctx.db.user.update({
                where: {
                    id: ctx.user.userId!,
                },
                data: {
                    credits: {
                        decrement: fileCount,
                    },
                },
            });
            return project;
        }),
    getProjects: protectedProcedure
        .query(async ({ ctx }) => {
            return await ctx.db.project.findMany({
                where: {
                    userToProjects: {
                        some: {
                            userId: ctx.user.userId!,
                        },
                    },
                    deletedAt: null,
                },
            })
        }),
    getCommits: protectedProcedure
        .input(z.object({
            projectId: z.string(),
        }))
        .query(async ({ ctx, input }) => {
            pollCommits(input.projectId).then().catch(console.error);
            return await ctx.db.commit.findMany({ where: { projectId: input.projectId } });
        }),
    saveAnswer: protectedProcedure
        .input(z.object({
            projectId: z.string(),
            fileReferences: z.any(),
            question: z.string(),
            answer: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.question.create({
                data: {
                    answer: input.answer,
                    fileReferences: input.fileReferences,
                    projectId: input.projectId,
                    question: input.question,
                    userId: ctx.user.userId!,
                }
            })
        }),
    getQuestions: protectedProcedure
        .input(z.object({
            projectId: z.string()
        }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.question.findMany({
                where: {
                    projectId: input.projectId,
                },
                include: {
                    user: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            })
        }),
    uploadMeeting: protectedProcedure
        .input(z.object({
            projectId: z.string(),
            meetingUrl: z.string(),
            name: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const meeting = await ctx.db.meeting.create({
                data: {
                    name: input.name,
                    projectId: input.projectId,
                    meetingUrl: input.meetingUrl,
                    status: "PROCESSING"
                }
            })

            return meeting;
        }),
    getMeetings: protectedProcedure
        .input(z.object({
            projectId: z.string(),
        }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.meeting.findMany({
                where: {
                    projectId: input.projectId,
                },
                include: {
                    issues: true,
                },
            })
        }),
    deleteMeeting: protectedProcedure
        .input(z.object({
            meetingId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.meeting.delete({
                where: {
                    id: input.meetingId,
                },
            });
        }),
    getMeetingById: protectedProcedure
        .input(z.object({
            meetingId: z.string(),
        }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.meeting.findUnique({
                where: {
                    id: input.meetingId,
                },
                include: {
                    issues: true,
                },
            });
        }),
    archiveProject: protectedProcedure
        .input(z.object({
            projectId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.project.update({
                where: {
                    id: input.projectId,
                },
                data: {
                    deletedAt: new Date(),
                },
            });
        }),
    getTeamMembers: protectedProcedure
        .input(z.object({
            projectId: z.string(),
        }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.userToProject.findMany({
                where: {
                    projectId: input.projectId,
                },
                include: {
                    user: true,
                },
            });
        }),
    getCredits: protectedProcedure
        .query(async ({ ctx }) => {
            return await ctx.db.user.findUnique({
                where: {
                    id: ctx.user.userId!,
                },
                select: {
                    credits: true,
                    firstName: true,
                    lastName: true,
                    emailAddress: true,
                },
            });
        }),
    checkCredits: protectedProcedure
        .input(z.object({
            githubUrl: z.string(),
            githubToken: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const fileCount = await checkCredits(input.githubUrl, input.githubToken);
            const userCredits = await ctx.db.user.findUnique({
                where: {
                    id: ctx.user.userId!,
                },
                select: {
                    credits: true,
                },
            });

            return { fileCount, userCredits: userCredits?.credits || 0 };
        })
});