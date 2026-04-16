import { useServerFn } from "@tanstack/react-start";
import { logoutFn } from "@/server/services/auth/functions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: () => logoutFn({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });

      navigate({ to: "/login" });
      toast.success("Desconectado com sucesso");
    },
    onError: (error) => toast.error(error.message),
  });

  return { logout: mutate };
}
