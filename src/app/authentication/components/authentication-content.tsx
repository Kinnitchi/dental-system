"use client";

import { Home } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { LoginForm } from "@/app/authentication/components/login-form";
import { RegisterForm } from "@/app/authentication/components/sign-up-form";
import logo from "@/assets/images/fundo-de-publicidade-de-clinica-dentaria.jpg";
import { Spinner } from "@/components/ui/spinner";

export function AuthenticationContent() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSwitch = (to: boolean) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsSignUp(to);
      setIsTransitioning(false);
    }, 600);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[3fr_2fr]">
      <div className="bg-muted relative hidden overflow-hidden lg:block">
        <Image src={logo} alt="Clínica Dental" fill className="object-cover object-left" priority />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute right-8 bottom-10 left-8 text-white">
          <h2 className="text-3xl leading-snug font-bold drop-shadow-lg">Cuidando do seu sorriso</h2>
          <p className="mt-2 text-sm text-white/80">Gerencie sua clínica com praticidade e eficiência.</p>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Home className="size-4" />
            </div>
            <span>Sistema de gerenciamento de clínica</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {isTransitioning ? (
              <div className="flex min-h-50 items-center justify-center">
                <Spinner className="size-8" />
              </div>
            ) : isSignUp ? (
              <RegisterForm onSignIn={() => handleSwitch(false)} />
            ) : (
              <LoginForm onSignUp={() => handleSwitch(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
