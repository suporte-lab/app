import { useMutation } from "@tanstack/react-query";
import { loginFn } from "@/server/services/auth/functions";
import { useForm } from "@tanstack/react-form";
import { loginSchema } from "@/server/services/auth/schemas";
import { zodToFieldErrors } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import z from "zod";
import { toast } from "sonner";

type LoginFormParams = z.infer<ReturnType<typeof loginSchema>>;

export function useLogin() {
  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: loginFn,
    onSuccess: () => navigate({ to: "/dashboard" }),
    onError: (error) => toast.error(error.message),
  });

  const defaultValues: LoginFormParams = {
    email: "",
    password: "",
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = loginSchema().safeParse(value);
        return !result.success ? zodToFieldErrors(result.error) : undefined;
      },
    },
    onSubmit: ({ value }) => {
      mutate({ data: value });
    },
  });

  return {
    form,
  };
}
