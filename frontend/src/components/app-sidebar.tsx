import * as React from "react";
import { IconDashboard, IconInnerShadowTop } from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Building, CalendarSearch, Clipboard, Flag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { AuthSession } from "@server/types";

const data = {
  navMain: [
    {
      title: "Painel Principal",
      url: "/dashboard",
      icon: <IconDashboard />,
    },
    {
      title: "Municípios",
      url: "/dashboard/municipality",
      icon: <Flag />,
    },
    {
      title: "Unidades",
      url: "/dashboard/project",
      icon: <Building />,
    },
    {
      title: "Formulários",
      url: "/dashboard/survey",
      icon: <Clipboard />,
    },
    {
      title: "Pesquisas",
      url: "/dashboard/research",
      icon: <CalendarSearch />,
    },
  ],
};

interface Props extends React.ComponentProps<typeof Sidebar> {
  auth: AuthSession;
}

export function AppSidebar({ auth, ...props }: Props) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/dashboard">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">CincoBasicos</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>{auth.user && <NavUser user={auth.user} />}</SidebarFooter>
    </Sidebar>
  );
}
