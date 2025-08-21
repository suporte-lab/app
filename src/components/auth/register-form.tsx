import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/use-register";
import { FieldError } from "../field-error";
import { Link } from "@tanstack/react-router";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { form } = useRegister();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome</CardTitle>
          <CardDescription>Create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <div className="grid gap-6">
              <div className="grid gap-6">
                <form.Field
                  name="nickname"
                  children={(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Nickname</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldError error={field.state.meta.errors?.join(", ")} />
                    </div>
                  )}
                />
                <form.Field
                  name="email"
                  children={(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Email</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldError error={field.state.meta.errors?.join(", ")} />
                    </div>
                  )}
                />

                <form.Field
                  name="password"
                  children={(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Password</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldError error={field.state.meta.errors?.join(", ")} />
                    </div>
                  )}
                />

                <form.Field
                  name="confirmPassword"
                  children={(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Confirm Password</Label>

                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldError error={field.state.meta.errors?.join(", ")} />
                    </div>
                  )}
                />

                <Button type="submit" className="w-full">
                  Register
                </Button>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
