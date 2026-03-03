"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    name: z.string().min(1, { message: "Nome é obrigatório" }).max(30),
    email: z.string().trim().min(1, { message: "Email é obrigatório" }).email({ message: "Email inválido" }),
    password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
    confirmPassword: z.string().min(1, { message: "Confirmação de senha é obrigatória" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

interface RegisterFormProps extends React.ComponentProps<"form"> {
  onSignIn: () => void;
}

export function RegisterForm({ className, onSignIn, ...props }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = (data: z.infer<typeof registerSchema>) => {
    console.log("register", data);
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Crie sua conta</h1>
          <p className="text-sm text-balance">Preencha os campos abaixo para criar sua conta</p>
        </div>
        <Field>
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="name">Nome completo</FieldLabel>
            <Input id="name" type="text" placeholder="João Silva" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <span className="text-destructive text-xs">{errors.name.message}</span>}
          </div>
        </Field>
        <Field>
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && <span className="text-destructive text-xs">{errors.email.message}</span>}
          </div>
        </Field>
        <Field>
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="password">Senha</FieldLabel>
            <Input id="password" type="password" aria-invalid={!!errors.password} {...register("password")} />
            {errors.password && <span className="text-destructive text-xs">{errors.password.message}</span>}
          </div>
        </Field>
        <Field>
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="confirm-password">Confirme a senha</FieldLabel>
            <Input
              id="confirm-password"
              type="password"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <span className="text-destructive text-xs">{errors.confirmPassword.message}</span>
            )}
          </div>
        </Field>
        <Field>
          <Button type="submit">Criar conta</Button>
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
