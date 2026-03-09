import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";

import { EnterpriseCard } from "../(protected)/subscription/_components/enterprise-card";
import { PricingCard } from "../(protected)/subscription/_components/princing-card";

const plans = [
  {
    name: "Básico",
    price: "R$ 59",
    period: "/mês",
    description: "Para profissionais que estão começando.",
    features: [
      "Cadastro de até 3 médicos",
      "Agendamentos ilimitados",
      "Métricas básicas",
      "Cadastro de pacientes",
      "Confirmação manual",
      "Suporte via e-mail",
    ],
    buttonText: "Começar Agora",
    isPopular: false,
    planKey: "essential",
    stripeEnabled: true,
  },
  {
    name: "Profissional",
    price: "R$ 197",
    period: "/mês",
    description: "Para clínicas em crescimento.",
    features: [
      "Até 500 pacientes",
      "Tudo do plano Básico",
      "Teleconsulta integrada",
      "Financeiro completo",
      "Relatórios avançados",
      "Suporte prioritário",
    ],
    buttonText: "Assinar Profissional",
    isPopular: true,
    planKey: "professional",
    stripeEnabled: false,
  },
  {
    name: "Clínica",
    price: "R$ 397",
    period: "/mês",
    description: "Para clínicas com múltiplos profissionais.",
    features: [
      "Pacientes ilimitados",
      "Tudo do plano Profissional",
      "Até 10 profissionais",
      "Multi-unidades",
      "API de integração",
      "Gerente de conta dedicado",
    ],
    buttonText: "Assinar Clínica",
    isPopular: false,
    planKey: "clinic",
    stripeEnabled: false,
  },
];

const enterpriseFeatures = [
  "Profissionais ilimitados",
  "SLA garantido de 99.9%",
  "SAML SSO",
  "Suporte 24/7",
  "Customização completa",
  "Treinamento presencial",
];

const SubscriptionPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Assinatura</PageTitle>
          <PageDescription>
            Escolha o plano ideal para sua clínica. Comece imediatamente e economize até{" "}
            <span className="text-primary font-semibold">15 horas por semana</span> em tarefas administrativas.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="bg-background min-h-screen">
          {/* Hero Section */}
          <div className="mx-auto max-w-7xl px-4">
            {/* Pricing Cards */}
            <div className="mx-auto mt-16 grid max-w-6xl gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <PricingCard
                  key={plan.name}
                  name={plan.name}
                  price={plan.price}
                  period={plan.period}
                  description={plan.description}
                  features={plan.features}
                  isPopular={plan.isPopular}
                  buttonText={plan.buttonText}
                  active={session.user.plan === plan.planKey}
                  userEmail={session.user.email}
                  stripeEnabled={plan.stripeEnabled}
                />
              ))}
            </div>

            {/* Enterprise Card */}
            <div className="mx-auto mt-8 max-w-6xl">
              <EnterpriseCard features={enterpriseFeatures} />
            </div>

            {/* Social Proof */}
            <div className="mt-16 text-center">
              <p className="text-muted-foreground text-sm">
                Junte-se a mais de <span className="text-foreground font-semibold">2.000+ profissionais</span> que já
                transformaram sua rotina com nossa solução.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-foreground text-3xl font-bold">98%</div>
                  <div className="text-muted-foreground text-sm">Satisfação</div>
                </div>
                <div className="bg-border h-12 w-px"></div>
                <div className="text-center">
                  <div className="text-foreground text-3xl font-bold">15h</div>
                  <div className="text-muted-foreground text-sm">Economia semanal</div>
                </div>
                <div className="bg-border h-12 w-px"></div>
                <div className="text-center">
                  <div className="text-foreground text-3xl font-bold">24/7</div>
                  <div className="text-muted-foreground text-sm">Disponibilidade</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default SubscriptionPage;
