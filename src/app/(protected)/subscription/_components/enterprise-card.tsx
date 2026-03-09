"use client";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EnterpriseCardProps {
  features: string[];
  onContact?: () => void;
}

export function EnterpriseCard({ features, onContact }: EnterpriseCardProps) {
  return (
    <div className="border-border bg-card/50 rounded-2xl border p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <h3 className="text-foreground text-2xl font-semibold">Enterprise</h3>
          <p className="text-muted-foreground mt-2">
            Para redes de clínicas que precisam de recursos avançados e suporte dedicado.
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <Check className="text-primary h-5 w-5 shrink-0" />
                <span className="text-muted-foreground text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="shrink-0">
          <Button
            onClick={onContact}
            variant="outline"
            size="lg"
            className="border-border text-foreground hover:bg-secondary w-full md:w-auto"
          >
            Fale Conosco
          </Button>
        </div>
      </div>
    </div>
  );
}
