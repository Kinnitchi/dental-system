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

const registerSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
    email: z.string().trim().min(1, { message: "E-mail é obrigatório" }).email({ message: "E-mail inválido" }),
    password: z.string().trim().min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
    confirmPassword: z.string().trim().min(1, { message: "Confirmação de senha é obrigatória" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

interface RegisterFormProps {
  onSignIn?: () => void;
}

export function RegisterForm({ onSignIn }: RegisterFormProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
      },
      {
        onSuccess: () => {
          toast.success("Conta criada com sucesso!", { position: "top-right" });
          router.push("/dashboard");
        },
        onError: (ctx) => {
          console.error(ctx.error);

          if (ctx.error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
            toast.error("E-mail já cadastrado.", { position: "bottom-right" });
            return;
          }

          toast.error("Erro ao criar conta.", { position: "bottom-right" });
          return;
        },
      }
    );
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Crie sua conta</h1>
          <p className="text-sm text-balance">Preencha os campos abaixo para criar sua conta</p>
        </div>
        <Field>
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="name">Nome completo</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder="João Silva"
              aria-invalid={!!form.formState.errors.name}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <span className="text-destructive text-xs">{form.formState.errors.name.message}</span>
            )}
          </div>
        </Field>
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
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="password">Senha</FieldLabel>
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
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="confirm-password">Confirme a senha</FieldLabel>
            <Input
              id="confirm-password"
              type="password"
              aria-invalid={!!form.formState.errors.confirmPassword}
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <span className="text-destructive text-xs">{form.formState.errors.confirmPassword.message}</span>
            )}
          </div>
        </Field>
        <Field>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar conta"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Já tem uma conta?{" "}
            <button type="button" onClick={onSignIn} className="cursor-pointer underline underline-offset-4">
              Entrar
            </button>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
