"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { upsertAppointment } from "@/actions/upsert-appointment/actions";
import { upsertAppointmentSchema } from "@/actions/upsert-appointment/schema";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
    .toString()
    .padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

interface UpsertAppointmentFormProps {
  appointment?: typeof appointmentsTable.$inferSelect;
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  onSuccess?: () => void;
}

const UpsertAppointmentForm = ({ appointment, patients, doctors, onSuccess }: UpsertAppointmentFormProps) => {
  const form = useForm<z.infer<typeof upsertAppointmentSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(upsertAppointmentSchema),
    defaultValues: {
      patientId: appointment?.patientId ?? "",
      doctorId: appointment?.doctorId ?? "",
      date: appointment?.date ? new Date(appointment.date) : undefined,
      status: appointment?.status ?? "scheduled",
      appointmentPriceInCents: appointment?.appointmentPriceInCents ?? 0,
    },
  });

  const selectedDoctorId = form.watch("doctorId");
  const selectedDoctor = useMemo(() => doctors.find((d) => d.id === selectedDoctorId), [selectedDoctorId, doctors]);

  // Quando o médico muda, pré-preenche o preço com o valor padrão do médico
  useEffect(() => {
    if (selectedDoctor && !appointment) {
      form.setValue("appointmentPriceInCents", selectedDoctor.appointmentPriceInCents);
    }
  }, [selectedDoctor, appointment, form]);

  const upsertAppointmentAction = useAction(upsertAppointment, {
    onSuccess: () => {
      toast.success(appointment ? "Agendamento atualizado com sucesso." : "Agendamento criado com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error(appointment ? "Erro ao atualizar agendamento." : "Erro ao criar agendamento.");
    },
  });

  const onSubmit = (values: z.infer<typeof upsertAppointmentSchema>) => {
    upsertAppointmentAction.execute({ ...values, id: appointment?.id });
  };

  return (
    <DialogContent className="flex max-h-[90vh] max-w-md flex-col">
      <DialogHeader>
        <DialogTitle>{appointment ? "Editar agendamento" : "Adicionar agendamento"}</DialogTitle>
        <DialogDescription>
          {appointment ? "Edite as informações desse agendamento." : "Adicione um novo agendamento."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form
          id="upsert-appointment"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1"
        >
          {/* Paciente */}
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent position="popper" className="max-h-60 overflow-y-auto">
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Médico */}
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Médico</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um médico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent position="popper" className="max-h-60 overflow-y-auto">
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Especialização (readonly) */}
          {selectedDoctor && (
            <FormItem>
              <FormLabel>Especialização</FormLabel>
              <Input value={selectedDoctor.specialty} disabled />
            </FormItem>
          )}

          {/* Valor da consulta (editável) */}
          <FormField
            control={form.control}
            name="appointmentPriceInCents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da consulta</FormLabel>
                <FormControl>
                  <NumericFormat
                    customInput={Input}
                    prefix="R$ "
                    decimalSeparator=","
                    thousandSeparator="."
                    decimalScale={2}
                    fixedDecimalScale
                    placeholder="R$ 0,00"
                    value={field.value / 100}
                    onValueChange={(values) => field.onChange(Math.round((values.floatValue ?? 0) * 100))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data e hora separados */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? dayjs(field.value).format("YYYY-MM-DD") : ""}
                      onChange={(e) => {
                        const currentTime = field.value ? dayjs(field.value).format("HH:mm") : "08:00";
                        field.onChange(e.target.value ? new Date(`${e.target.value}T${currentTime}`) : undefined);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário</FormLabel>
                  <Select
                    value={field.value ? dayjs(field.value).format("HH:mm") : ""}
                    onValueChange={(time) => {
                      const currentDate = field.value
                        ? dayjs(field.value).format("YYYY-MM-DD")
                        : dayjs().format("YYYY-MM-DD");
                      field.onChange(new Date(`${currentDate}T${time}`));
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent position="popper" className="max-h-60 overflow-y-auto">
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent position="popper">
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <DialogFooter>
        <Button form="upsert-appointment" type="submit" disabled={upsertAppointmentAction.isPending}>
          {upsertAppointmentAction.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default UpsertAppointmentForm;
