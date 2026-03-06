"use client";

import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import { Edit2Icon, MoreHorizontalIcon, Trash } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteAppointment } from "@/actions/delete-appointment/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/currency";

import UpsertAppointmentForm from "./upsert-appointment-form";

dayjs.locale("pt-br");

type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: typeof patientsTable.$inferSelect;
  doctor: typeof doctorsTable.$inferSelect;
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "default",
  completed: "secondary",
  cancelled: "destructive",
};

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Agendado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

interface AppointmentTableProps {
  appointments: AppointmentWithRelations[];
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
}

const AppointmentTable = ({ appointments, patients, doctors }: AppointmentTableProps) => {
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithRelations | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<AppointmentWithRelations | null>(null);

  const deleteAppointmentAction = useAction(deleteAppointment, {
    onSuccess: () => {
      toast.success("Agendamento deletado com sucesso.");
      setDeletingAppointment(null);
    },
    onError: () => {
      toast.error("Erro ao deletar agendamento.");
    },
  });

  if (appointments.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhum agendamento cadastrado.</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead>Médico</TableHead>
            <TableHead>Especialização</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell className="font-medium">{appointment.patient.name}</TableCell>
              <TableCell>{appointment.doctor.name}</TableCell>
              <TableCell>{appointment.doctor.specialty}</TableCell>
              <TableCell>{dayjs(appointment.date).format("DD/MM/YYYY HH:mm")}</TableCell>
              <TableCell>{formatCurrencyInCents(appointment.appointmentPriceInCents)}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[appointment.status]}>{STATUS_LABEL[appointment.status]}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Dialog
                  open={editingAppointment?.id === appointment.id}
                  onOpenChange={(open) => {
                    if (!open) setEditingAppointment(null);
                  }}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40" align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>{appointment.patient.name}</DropdownMenuLabel>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            className="flex items-center gap-2"
                            onClick={() => setEditingAppointment(appointment)}
                          >
                            <Edit2Icon className="h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive flex items-center gap-2"
                          onClick={() => setDeletingAppointment(appointment)}
                        >
                          <Trash className="h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {editingAppointment?.id === appointment.id && (
                    <UpsertAppointmentForm
                      appointment={editingAppointment}
                      patients={patients}
                      doctors={doctors}
                      onSuccess={() => setEditingAppointment(null)}
                    />
                  )}
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!deletingAppointment}
        onOpenChange={(open) => {
          if (!open) setDeletingAppointment(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja deletar esse agendamento?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser revertida.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingAppointment) {
                  deleteAppointmentAction.execute({
                    id: deletingAppointment.id,
                  });
                }
              }}
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AppointmentTable;
