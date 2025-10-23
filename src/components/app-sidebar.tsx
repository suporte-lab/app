import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
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
import { useSuspenseQuery } from "@tanstack/react-query";
import { userQueryOptions } from "@/server/services/auth/functions";
import { Building, CalendarSearch, Clipboard, Flag } from "lucide-react";
import { Link } from "@tanstack/react-router";

const data = {
  navMain: [
    {
      title: "Painel Principal",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Municípios",
      url: "/dashboard/municipality",
      icon: Flag,
    },
    {
      title: "Unidades",
      url: "/dashboard/project",
      icon: Building,
    },
    {
      title: "Formulários",
      url: "/dashboard/survey",
      icon: Clipboard,
    },
    {
      title: "Pesquisas",
      url: "/dashboard/research",
      icon: CalendarSearch,
    },
    // {
    //   title: "Users",
    //   url: "#",
    //   icon: Users,
    // },
  ],
  navClouds: [],
  navSecondary: [],
  documents: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user } = useSuspenseQuery(userQueryOptions());

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">CincoBasicos</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
