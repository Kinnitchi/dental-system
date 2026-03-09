"use client";

import { Check, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";

import { createStripeCheckout } from "@/actions/create-stripe-checkout/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  active?: boolean;
  userEmail?: string;
  stripeEnabled?: boolean;
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  isPopular = false,
  buttonText,
  active = false,
  userEmail,
  stripeEnabled = false,
}: PricingCardProps) {
  const { execute, isExecuting } = useAction(createStripeCheckout, {
    onSuccess: ({ data }) => {
      if (!data?.url) return;
      window.location.href = data.url;
    },
  });

  const handleClick = () => {
    if (active && userEmail) {
      window.open(`${process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL}?prefilled_email=${userEmail}`, "_blank");
    } else if (stripeEnabled) {
      execute();
    }
  };

  const buttonLabel = active ? "Gerenciar assinatura" : stripeEnabled ? buttonText : "Em breve";
  const isDisabled = isExecuting || (!active && !stripeEnabled);

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02]",
        isPopular
          ? "border-primary bg-card shadow-primary/10 shadow-lg"
          : "border-border bg-card/50 hover:border-primary/50"
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground rounded-full px-4 py-1 text-xs font-semibold">
            Recomendado
          </span>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-xl font-semibold">{name}</h3>
          {active && <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Atual</Badge>}
        </div>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-foreground text-4xl font-bold tracking-tight">{price}</span>
          <span className="text-muted-foreground">{period}</span>
        </div>
        <p className="text-muted-foreground mt-3 text-sm">{description}</p>
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className={cn("mt-0.5 h-5 w-5 shrink-0", isPopular ? "text-primary" : "text-muted-foreground")} />
            <span className="text-muted-foreground text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className="w-full"
        variant={isPopular ? "default" : "outline"}
        onClick={handleClick}
        disabled={isDisabled}
      >
        {isExecuting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : buttonLabel}
      </Button>
    </div>
  );
}
