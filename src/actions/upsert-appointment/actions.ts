"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertAppointmentSchema } from "./schema";

export const upsertAppointment = actionClient.schema(upsertAppointmentSchema).action(async ({ parsedInput }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  if (!session.user.clinic?.id) {
    throw new Error("Clinic not found");
  }

  await db
    .insert(appointmentsTable)
    .values({
      id: parsedInput.id,
      clinicId: session.user.clinic.id,
      patientId: parsedInput.patientId,
      doctorId: parsedInput.doctorId,
      date: parsedInput.date,
      status: parsedInput.status,
      appointmentPriceInCents: parsedInput.appointmentPriceInCents,
    })
    .onConflictDoUpdate({
      target: [appointmentsTable.id],
      set: {
        patientId: parsedInput.patientId,
        doctorId: parsedInput.doctorId,
        date: parsedInput.date,
        status: parsedInput.status,
        appointmentPriceInCents: parsedInput.appointmentPriceInCents,
      },
    });

  revalidatePath("/appointments");
});
