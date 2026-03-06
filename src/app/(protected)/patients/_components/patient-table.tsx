"use client";

import { Edit2Icon, MoreVerticalIcon, Trash } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";

import { deletePatient } from "@/actions/delete-patient/actions";
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
import { patientsTable } from "@/db/schema";

import UpsertPatientsForm from "./upsert-patients-form";

interface PatientTableProps {
  patients: (typeof patientsTable.$inferSelect)[];
}

const PatientTable = ({ patients }: PatientTableProps) => {
  const [editingPatient, setEditingPatient] = useState<typeof patientsTable.$inferSelect | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<typeof patientsTable.$inferSelect | null>(null);

  const deletePatientAction = useAction(deletePatient, {
    onSuccess: () => {
      toast.success("Paciente deletado com sucesso.");
      setDeletingPatient(null);
    },
    onError: () => {
      toast.error("Erro ao deletar paciente.");
    },
  });

  if (patients.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhum paciente cadastrado.</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ color: "var(--color-primary)" }}>Nome</TableHead>
            <TableHead style={{ color: "var(--color-primary)" }}>E-mail</TableHead>
            <TableHead style={{ color: "var(--color-primary)" }}>Telefone</TableHead>
            <TableHead style={{ color: "var(--color-primary)" }}>Sexo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell>{patient.email}</TableCell>
              <TableCell>
                <PatternFormat value={patient.phoneNumber} format="(##) #####-####" displayType="text" />
              </TableCell>
              <TableCell>{patient.sex === "male" ? "Masculino" : "Feminino"}</TableCell>
              <TableCell className="text-right">
                <Dialog
                  open={editingPatient?.id === patient.id}
                  onOpenChange={(open) => {
                    if (!open) setEditingPatient(null);
                  }}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <MoreVerticalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40" align="start">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>{patient.name}</DropdownMenuLabel>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            className="flex items-center gap-2"
                            onClick={() => setEditingPatient(patient)}
                          >
                            <Edit2Icon className="h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive flex items-center gap-2"
                          onClick={() => setDeletingPatient(patient)}
                        >
                          <Trash className="text-destructive h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {editingPatient?.id === patient.id && (
                    <UpsertPatientsForm patient={editingPatient} onSuccess={() => setEditingPatient(null)} />
                  )}
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!deletingPatient}
        onOpenChange={(open) => {
          if (!open) setDeletingPatient(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja deletar esse paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser revertida. Isso irá deletar o paciente e todos os dados relacionados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingPatient) {
                  deletePatientAction.execute({ id: deletingPatient.id });
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

export default PatientTable;
