import { useQueryClient } from "@tanstack/react-query";

const useRefetch = () => {
    const queryClient = useQueryClient();
    const refetch = async () => {
        await queryClient.refetchQueries({
            type: "active",
        });
    };

    return refetch;
};

export default useRefetch;