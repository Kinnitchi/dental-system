"use client";

import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { LoginForm } from "@/app/authentication/components/login-form";
import { RegisterForm } from "@/app/authentication/components/sign-up-form";
import { Spinner } from "@/components/ui/spinner";

export default function AuthenticationPage() {
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
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-muted relative hidden lg:block">
        <Image src="/placeholder.svg" alt="Image" fill className="object-cover dark:brightness-[0.2] dark:grayscale" />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span>System Dental</span>
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
