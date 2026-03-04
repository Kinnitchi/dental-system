"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().trim().min(1, { message: "Email é obrigatório" }).email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "Senha é obrigatória" }),
});

interface LoginFormProps extends React.ComponentProps<"form"> {
  onSignUp: () => void;
}

export function LoginForm({ className, onSignUp, ...props }: LoginFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          toast.success("Login bem-sucedido!", { position: "top-right" });
          router.push("/dashboard");
        },
        onError: (ctx) => {
          console.log(ctx.error);
          toast.error("Email ou senha inválidos.", { position: "bottom-right" });
          return;
        },
      }
    );
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Faça login na sua conta</h1>
          <p className="text-sm text-balance">Insira seu email abaixo para fazer login na sua conta</p>
        </div>
        <Field>
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              aria-invalid={!!form.formState.errors.email}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <span className="text-destructive text-xs">{form.formState.errors.email.message}</span>
            )}
          </div>
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Senha</FieldLabel>
            <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
              Esqueceu sua senha?
            </a>
          </div>
          <div className="flex flex-col gap-1">
            <Input
              id="password"
              type="password"
              aria-invalid={!!form.formState.errors.password}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <span className="text-destructive text-xs">{form.formState.errors.password.message}</span>
            )}
          </div>
        </Field>
        <Field>
          <Button type="submit">
            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Entrar"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Não tem uma conta?{" "}
            <button type="button" onClick={onSignUp} className="cursor-pointer underline underline-offset-4">
              Criar conta
            </button>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
