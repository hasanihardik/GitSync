import { useLocalStorage } from "usehooks-ts";
import { api } from "@/trpc/react";

const useGetProjects = () => {
    const { data: projects } = api.project.getProjects.useQuery();
    const [projectId, setProjectId] = useLocalStorage("gitSync-projectId", "");
    const project = projects?.find((project) => project.id === projectId);

    return {
        projects,
        project,
        projectId,
        setProjectId,
    };
};

export default useGetProjects;