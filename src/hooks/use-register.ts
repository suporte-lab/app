import { useMutation } from "@tanstack/react-query";
import { registerFn } from "@/server/services/auth/functions";
import { useForm } from "@tanstack/react-form";
import { registerSchema } from "@/server/services/auth/schemas";
import { zodToFieldErrors } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import z from "zod";
import { toast } from "sonner";

type RegisterFormParams = z.infer<ReturnType<typeof registerSchema>>;

export function useRegister() {
  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: registerFn,
    onSuccess: () => navigate({ to: "/dashboard" }),
    onError: (error) => toast.error(error.message),
  });

  const defaultValues: RegisterFormParams = {
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = registerSchema().safeParse(value);
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
