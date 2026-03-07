"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo } from "react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { getAvailableTimes } from "@/actions/get-avaliable-times/actions";
import { addAppointment } from "@/actions/upsert-appointment/actions";
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

const upsertFormSchema = z.object({
  patientId: z.string().uuid({ message: "Paciente é obrigatório." }),
  doctorId: z.string().uuid({ message: "Médico é obrigatório." }),
  date: z.date({ message: "Data é obrigatória." }),
  status: z.enum(["scheduled", "completed", "cancelled"]),
  appointmentPriceInCents: z.number().min(0, { message: "Valor é obrigatório." }),
});

import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface UpsertAppointmentFormProps {
  appointment?: typeof appointmentsTable.$inferSelect;
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  onSuccess?: () => void;
}

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const UpsertAppointmentForm = ({ appointment, patients, doctors, onSuccess }: UpsertAppointmentFormProps) => {
  const form = useForm<z.infer<typeof upsertFormSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(upsertFormSchema),
    defaultValues: {
      patientId: appointment?.patientId ?? "",
      doctorId: appointment?.doctorId ?? "",
      date: appointment?.date ? new Date(appointment.date) : undefined,
      status: appointment?.status ?? "scheduled",
      appointmentPriceInCents: appointment?.appointmentPriceInCents ?? 0,
    },
  });

  const selectedDoctorId = form.watch("doctorId");
  const selectedPatientId = form.watch("patientId");
  const selectedDate = form.watch("date");

  const selectedDoctor = useMemo(() => doctors.find((d) => d.id === selectedDoctorId), [selectedDoctorId, doctors]);

  // Quando o médico muda, pré-preenche o preço com o valor padrão do médico
  useEffect(() => {
    if (selectedDoctor && !appointment) {
      form.setValue("appointmentPriceInCents", selectedDoctor.appointmentPriceInCents);
    }
  }, [selectedDoctor, appointment, form]);

  // Busca horários disponíveis quando médico + data estão selecionados
  const getAvailableTimesAction = useAction(getAvailableTimes);

  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      getAvailableTimesAction.execute({
        doctorId: selectedDoctorId,
        date: dayjs(selectedDate).format("YYYY-MM-DD"),
        patientId: selectedPatientId || undefined,
        appointmentId: appointment?.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctorId, selectedPatientId, selectedDate ? dayjs(selectedDate).format("YYYY-MM-DD") : null]);

  const availableTimesResult = getAvailableTimesAction.result?.data as
    | { doctorAvailable: boolean; timeSlots: { value: string; available: boolean; label: string }[] }
    | undefined;
  const timeSlots = availableTimesResult?.timeSlots ?? [];

  // Função para desabilitar dias fora do período de atuação do médico
  const isDateDisabled = (date: Date) => {
    const today = dayjs().startOf("day");
    if (dayjs(date).isBefore(today)) return true;
    if (!selectedDoctor) return false;
    const dayOfWeek = dayjs(date).day();
    const from = Number(selectedDoctor.availableFromWeekDay);
    const to = Number(selectedDoctor.availableToWeekDay);
    return dayOfWeek < from || dayOfWeek > to;
  };

  const [datePickerOpen, setDatePickerOpen] = React.useState(false);

  const upsertAppointmentAction = useAction(addAppointment, {
    onSuccess: () => {
      toast.success(appointment ? "Agendamento atualizado com sucesso." : "Agendamento criado com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error(appointment ? "Erro ao atualizar agendamento." : "Erro ao criar agendamento.");
    },
  });

  const onSubmit = (values: z.infer<typeof upsertFormSchema>) => {
    const time = dayjs(values.date).format("HH:mm:ss");
    upsertAppointmentAction.execute({
      patientId: values.patientId,
      doctorId: values.doctorId,
      date: values.date,
      time,
      appointmentPriceInCents: values.appointmentPriceInCents,
      status: values.status,
    });
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
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? formatDate(field.value) : "Selecione uma data"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            const currentTime = field.value ? dayjs(field.value).format("HH:mm") : "08:00";
                            const [hours, minutes] = currentTime.split(":");
                            const newDate = new Date(date);
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(newDate);
                          } else {
                            field.onChange(undefined);
                          }
                          setDatePickerOpen(false);
                        }}
                        disabled={isDateDisabled}
                        locale={ptBR}
                        formatters={{
                          formatCaption: (date) => {
                            const formatted = new Intl.DateTimeFormat("pt-BR", {
                              month: "long",
                              year: "numeric",
                            }).format(date);
                            return formatted.charAt(0).toUpperCase() + formatted.slice(1);
                          },
                        }}
                      />
                    </PopoverContent>
                  </Popover>
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
                    disabled={!selectedDoctorId || !selectedDate || getAvailableTimesAction.isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            !selectedDoctorId
                              ? "Sel. médico primeiro"
                              : !selectedDate
                                ? "Sel. data primeiro"
                                : getAvailableTimesAction.isPending
                                  ? "Carregando..."
                                  : "Selecione"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent position="popper" className="max-h-60 overflow-y-auto">
                      {timeSlots.length === 0 && !getAvailableTimesAction.isPending ? (
                        <div className="text-muted-foreground px-3 py-2 text-sm">Nenhum horário disponível</div>
                      ) : (
                        timeSlots.map((slot) => (
                          <SelectItem key={slot.value} value={slot.label} disabled={!slot.available}>
                            {slot.label}
                            {!slot.available && " — ocupado"}
                          </SelectItem>
                        ))
                      )}
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
