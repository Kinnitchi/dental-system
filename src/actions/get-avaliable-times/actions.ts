"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import { generateTimeSlots } from "@/helpers/time";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getAvailableTimes = actionClient
  .schema(
    z.object({
      doctorId: z.string(),
      date: z.string().date(), // YYYY-MM-DD
      patientId: z.string().optional(),
      appointmentId: z.string().optional(), // ignorar o próprio agendamento ao editar
    })
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      throw new Error("Unauthorized");
    }
    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, parsedInput.doctorId),
    });
    if (!doctor) {
      throw new Error("Médico não encontrado");
    }
    const selectedDayOfWeek = dayjs(parsedInput.date).day();
    const doctorIsAvailable =
      selectedDayOfWeek >= doctor.availableFromWeekDay && selectedDayOfWeek <= doctor.availableToWeekDay;
    if (!doctorIsAvailable) {
      return { doctorAvailable: false, timeSlots: [] };
    }

    // Busca agendamentos do médico nesse dia
    const doctorAppointments = await db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.doctorId, parsedInput.doctorId),
    });

    // Busca agendamentos do paciente nesse dia (se informado)
    const patientAppointments = parsedInput.patientId
      ? await db.query.appointmentsTable.findMany({
          where: eq(appointmentsTable.patientId, parsedInput.patientId),
        })
      : [];

    const filterDay = (appts: typeof doctorAppointments) =>
      appts
        .filter((a) => dayjs(a.date).isSame(parsedInput.date, "day") && a.id !== parsedInput.appointmentId)
        .map((a) => dayjs(a.date).format("HH:mm:ss"));

    const doctorBusySlots = filterDay(doctorAppointments);
    const patientBusySlots = filterDay(patientAppointments);
    const busySlots = new Set([...doctorBusySlots, ...patientBusySlots]);

    const timeSlots = generateTimeSlots();

    const doctorAvailableFrom = dayjs()
      .utc()
      .set("hour", Number(doctor.availableFromTime.split(":")[0]))
      .set("minute", Number(doctor.availableFromTime.split(":")[1]))
      .set("second", 0)
      .local();
    const doctorAvailableTo = dayjs()
      .utc()
      .set("hour", Number(doctor.availableToTime.split(":")[0]))
      .set("minute", Number(doctor.availableToTime.split(":")[1]))
      .set("second", 0)
      .local();

    const doctorTimeSlots = timeSlots.filter((time: string) => {
      const t = dayjs()
        .utc()
        .set("hour", Number(time.split(":")[0]))
        .set("minute", Number(time.split(":")[1]))
        .set("second", 0);

      return (
        t.format("HH:mm:ss") >= doctorAvailableFrom.format("HH:mm:ss") &&
        t.format("HH:mm:ss") <= doctorAvailableTo.format("HH:mm:ss")
      );
    });

    return {
      doctorAvailable: true,
      timeSlots: doctorTimeSlots.map((time: string) => ({
        value: time,
        available: !busySlots.has(time),
        label: time.substring(0, 5),
      })),
    };
  });
