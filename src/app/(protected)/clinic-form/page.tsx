import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { ClinicForm } from "./_components/clinic-form";

export default async function ClinicFormPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/authentication");

  if (!session.user.plan) {
    redirect("/new-subscription");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <ClinicForm />
      </div>
    </div>
  );
}
