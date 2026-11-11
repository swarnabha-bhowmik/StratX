"use client";

import { useContext } from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { UserDetailContext } from "@/context/UserDetailContext";
import {
  AppWindow,
  Bot,
  Play,
  Blocks,
  Layers,
  CalendarClock,
  CreditCard,
} from "lucide-react";
import Image from "next/image";
import brandLogo from "@/public/brand-logo.png";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";

const workspaceNavItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: AppWindow,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-900",
  },
  {
    name: "Agents",
    path: "/dashboard/agents",
    icon: Bot,
    iconBg: "bg-green-100",
    iconColor: "text-green-900",
  },
  {
    name: "Runs",
    path: "/dashboard/runs",
    icon: Play,
    iconBg: "bg-red-100",
    iconColor: "text-red-900",
  },
  {
    name: "Integrations",
    path: "/dashboard/integrations",
    icon: Blocks,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-900",
  },
  {
    name: "Templates",
    path: "/dashboard/templates",
    icon: Layers,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-900",
  },
];

const userNavItems = [
  {
    name: "Schedules",
    path: "/dashboard/schedules",
    icon: CalendarClock,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-900",
  },
  {
    name: "Billing",
    path: "/dashboard/billing",
    icon: CreditCard,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-900",
  },
];

export function AppSidebar() {
  const path = usePathname();
  const { user } = useUser();
  const { userDetail } = useContext(UserDetailContext);

  const isTabActive = (itemPath: string) => {
    if (!path) return false;
    if (itemPath === "/dashboard") {
      return path === "/" || path === "/dashboard";
    }
    return path === itemPath || path.startsWith(itemPath + "/");
  };

  const getButtonClass = (itemPath: string) => {
    const active = isTabActive(itemPath);
    return `h-12 gap-3 transition-colors duration-150 rounded-lg cursor-pointer ${
      active
        ? "!bg-blue-100 !text-blue-900 font-semibold hover:!bg-blue-200 data-active:!bg-blue-100 data-active:!text-blue-900"
        : "bg-gray-100 text-gray-700 hover:!bg-blue-100 hover:!text-blue-900 active:!bg-blue-200"
    }`;
  };

  return (
    <Sidebar className="bg-gray-100 [&_[data-sidebar=sidebar]]:bg-gray-100 border-r border-gray-200">
      <SidebarHeader className="bg-gray-100 px-4 py-4 flex items-center justify-start">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src={brandLogo}
            alt="logo"
            width={220}
            height={120}
            className="w-auto h-20 object-contain"
            priority
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-gray-100 px-2 gap-3">
        <SidebarGroup className="gap-1 bg-gray-100 rounded-xl p-2">
          <SidebarGroupLabel className="text-gray-500 font-medium px-2">
            Workspace
          </SidebarGroupLabel>
          {workspaceNavItems.map((item) => {
            const Icon = item.icon;
            const active = isTabActive(item.path);
            return (
              <SidebarMenuButton
                key={item.path}
                render={<Link href={item.path} />}
                isActive={active}
                className={getButtonClass(item.path)}
              >
                <div
                  className={`flex h-9 w-8 shrink-0 ${
                    active ? "bg-white shadow-xs" : item.iconBg
                  } items-center justify-center rounded-lg transition-colors`}
                >
                  <Icon className={`h-[18px] w-[18px] ${item.iconColor}`} />
                </div>
                <span className={active ? "font-semibold text-blue-900" : ""}>
                  {item.name}
                </span>
              </SidebarMenuButton>
            );
          })}
        </SidebarGroup>

        <SidebarGroup className="gap-1 bg-gray-100 rounded-xl p-2">
          <SidebarGroupLabel className="text-gray-500 font-medium px-2">
            Operations
          </SidebarGroupLabel>
          {userNavItems.map((item) => {
            const Icon = item.icon;
            const active = isTabActive(item.path);
            return (
              <SidebarMenuButton
                key={item.path}
                render={<Link href={item.path} />}
                isActive={active}
                className={getButtonClass(item.path)}
              >
                <div
                  className={`flex h-9 w-8 shrink-0 ${
                    active ? "bg-white shadow-xs" : item.iconBg
                  } items-center justify-center rounded-lg transition-colors`}
                >
                  <Icon className={`h-[18px] w-[18px] ${item.iconColor}`} />
                </div>
                <span className={active ? "font-semibold text-blue-900" : ""}>
                  {item.name}
                </span>
              </SidebarMenuButton>
            );
          })}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-gray-100 p-3">
        <div className="p-2 border border-gray-200 bg-white rounded-lg flex gap-2 flex-col shadow-xs">
          <h2 className="flex justify-between">
            Agents <span>{userDetail?.agentCredits ?? 0}</span>
          </h2>
          <h2 className="flex justify-between">
            Credits <span>{userDetail?.usageCredits ?? 0}</span>
          </h2>
          <Progress value={66} />
        </div>
        <div className="flex items-center p-2 mt-2 gap-2.5">
          <UserButton />
          <span className="font-medium text-gray-900 truncate">
            {user?.username || userDetail?.name || user?.fullName || "User"}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
