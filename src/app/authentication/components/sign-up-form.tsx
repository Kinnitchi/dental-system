"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().trim().min(1, { message: "Email é obrigatório" }).email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "Senha é obrigatória" }),
});

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

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSwitch = (to: boolean) => {
    loginForm.clearErrors();
    registerForm.clearErrors();
    setIsTransitioning(true);
    setTimeout(() => {
      setIsSignUp(to);
      setIsTransitioning(false);
    }, 600);
  };

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    console.log("login", data);
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    console.log("register", data);
  };

  if (isTransitioning) {
    return (
      <div className="flex min-h-50 items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (isSignUp) {
    const {
      formState: { errors },
    } = registerForm;
    return (
      <form
        className={cn("flex flex-col gap-6", className)}
        {...props}
        onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Crie sua conta</h1>
            <p className="text-sm text-balance">Preencha os campos abaixo para criar sua conta</p>
          </div>
          <Field>
            <div className="flex flex-col gap-0">
              <FieldLabel htmlFor="name">Nome completo</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="João Silva"
                aria-invalid={!!errors.name}
                {...registerForm.register("name")}
              />
              {errors.name && <span className="text-destructive text-xs">{errors.name.message}</span>}
            </div>
          </Field>
          <Field>
            <div className="flex flex-col gap-0">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                aria-invalid={!!errors.email}
                {...registerForm.register("email")}
              />
              {errors.email && <span className="text-destructive text-xs">{errors.email.message}</span>}
            </div>
          </Field>
          <Field>
            <div className="flex flex-col gap-0">
              <FieldLabel htmlFor="password">Senha</FieldLabel>
              <Input
                id="password"
                type="password"
                aria-invalid={!!errors.password}
                {...registerForm.register("password")}
              />
              {errors.password && <span className="text-destructive text-xs">{errors.password.message}</span>}
            </div>
          </Field>
          <Field>
            <div className="flex flex-col gap-0">
              <FieldLabel htmlFor="confirm-password">Confirme a senha</FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                aria-invalid={!!errors.confirmPassword}
                {...registerForm.register("confirmPassword")}
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
              <button
                type="button"
                onClick={() => handleSwitch(false)}
                className="cursor-pointer underline underline-offset-4"
              >
                Entrar
              </button>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    );
  }

  const {
    formState: { errors },
  } = loginForm;
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
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
              aria-invalid={!!errors.email}
              {...loginForm.register("email")}
            />
            {errors.email && <span className="text-destructive text-xs">{errors.email.message}</span>}
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
            <Input id="password" type="password" aria-invalid={!!errors.password} {...loginForm.register("password")} />
            {errors.password && <span className="text-destructive text-xs">{errors.password.message}</span>}
          </div>
        </Field>
        <Field>
          <Button type="submit">Entrar</Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Não tem uma conta?{" "}
            <button
              type="button"
              onClick={() => handleSwitch(true)}
              className="cursor-pointer underline underline-offset-4"
            >
              Criar conta
            </button>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
