import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/authentication");

  const clinics = await db.query.usersToClinicsTable.findMany({
    where: eq(usersToClinicsTable.userId, session.user.id),
  });

  if (clinics.length === 0) {
    redirect("/clinic-form");
  }
  return (
    <>
      <div>
        <p>Dashboard</p>
        <h1>Welcome, {session?.user?.name}</h1>
        <h1>{session?.user?.email}</h1>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
    </>
  );
}
