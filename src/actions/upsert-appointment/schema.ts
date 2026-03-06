import { z } from "zod";

export const upsertAppointmentSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid({ message: "Paciente é obrigatório." }),
  doctorId: z.string().uuid({ message: "Médico é obrigatório." }),
  date: z.date({ required_error: "Data é obrigatória." }),
  status: z.enum(["scheduled", "completed", "cancelled"], {
    message: "Status é obrigatório.",
  }),
  appointmentPriceInCents: z.number().min(0, { message: "Valor é obrigatório." }),
});

export type UpsertAppointmentSchema = z.infer<typeof upsertAppointmentSchema>;
