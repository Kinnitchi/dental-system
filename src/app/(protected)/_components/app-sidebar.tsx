"use client";

import { CalendarDays, LayoutDashboard, Stethoscope, UsersRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Agendamentos",
    url: "#",
    icon: CalendarDays,
    items: [
      { title: "Visão Geral", url: "/appointments" },
      { title: "Agendar Consulta", url: "/appointments/new" },
    ],
  },
  {
    title: "Médicos",
    url: "/doctors",
    icon: Stethoscope,
    items: [
      { title: "Visão Geral", url: "/doctors" },
      { title: "Adicionar Médico", url: "/doctors/new" },
    ],
  },
  {
    title: "Pacientes",
    url: "/patients",
    icon: UsersRound,
    items: [
      { title: "Visão Geral", url: "/patients" },
      { title: "Adicionar Paciente", url: "/patients/new" },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const session = authClient.useSession();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/authentication"),
      },
    });
  };

  const user = {
    name: session.data?.user.name ?? "",
    email: session.data?.user.email ?? "",
    avatar: session.data?.user.image ?? "",
  };

  const clinicName = session.data?.user?.clinic?.name ?? "Clínica";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher clinicName={clinicName} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} pathname={pathname} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onSignOut={handleSignOut} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
