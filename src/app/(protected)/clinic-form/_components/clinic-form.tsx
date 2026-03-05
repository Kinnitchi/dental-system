"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { createClinic } from "@/actions/create-clinic/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const clinicSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome da clínica é obrigatório" }),
});

type ClinicFormData = z.infer<typeof clinicSchema>;

export function ClinicForm({ className }: React.ComponentProps<"form">) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = (data: ClinicFormData) => {
    startTransition(async () => {
      try {
        await createClinic(data.name);
        toast.success(`Clínica ${data.name} cadastrada com sucesso!`, { position: "bottom-right" });
        form.reset();
      } catch (error) {
        if (isRedirectError(error)) return;
        toast.error("Erro ao cadastrar clínica. Tente novamente.", { position: "bottom-right" });
      }
    });
  };

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <div className={cn("flex flex-col gap-6", className)}>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-xl">
              <Building2 className="size-6" />
            </div>
            <h1 className="text-2xl font-bold">Cadastrar clínica</h1>
            <p className="text-muted-foreground text-sm text-balance">Insira o nome da sua clínica para continuar.</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <div className="flex flex-col gap-1">
                  <FieldLabel htmlFor="name">Nome da clínica</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ex: Clínica Sorriso Feliz"
                    aria-invalid={!!form.formState.errors.name}
                    disabled={isPending}
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <span className="text-destructive text-xs">{form.formState.errors.name.message}</span>
                  )}
                </div>
              </Field>
            </FieldGroup>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Cadastrando..." : "Cadastrar clínica"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
