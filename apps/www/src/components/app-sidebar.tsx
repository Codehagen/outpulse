"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  LayoutDashboard,
  Phone,
  Settings2,
  CalendarClock,
  PuzzleIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data for our application.
const data = {
  user: {
    name: "Admin",
    email: "admin@example.com",
    avatar: "/avatars/user.jpg",
  },
  teams: [
    {
      name: "Outpulse",
      logo: Phone,
      plan: "Enterprise",
    },
  ],
};

// Define navigation items
const navItems = [
  {
    title: "Dashboard",
    url: "/pulse",
    icon: LayoutDashboard,
  },
  {
    title: "Agent Studio",
    url: "/pulse/studio",
    icon: Bot,
  },
  {
    title: "Campaign Manager",
    url: "/pulse/campaigns",
    icon: CalendarClock,
  },
  {
    title: "Analytics",
    url: "/pulse/analytics",
    icon: BarChart3,
  },
  {
    title: "Integrations",
    url: "/pulse/integrations",
    icon: PuzzleIcon,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  // Set active state based on current pathname
  const navMain = React.useMemo(() => {
    return navItems.map((item) => ({
      ...item,
      isActive:
        item.url === "/pulse"
          ? pathname === "/pulse" || pathname === "/pulse/"
          : pathname.startsWith(item.url),
    }));
  }, [pathname]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
