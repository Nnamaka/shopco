"use client";

import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {  Receipt, Container } from "lucide-react";
import { NavMain } from "./nav-main";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  {
    title: "Sales",
    url: "/admin/dashboard/sales",
    icon: Receipt,
    isActive: true,
  },
  { title: "Containers", url: "/admin/dashboard/containers", icon: Container },
];

export function AppSidebar({
  currentPath,
  ...props
}: React.ComponentProps<typeof Sidebar> & { currentPath: string }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/admin/dashboard") {
      router.push("/admin/dashboard/sales");
    }
  });
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <Link href="/" className="flex items-center justify-center">
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Shopco</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarContent>
        <NavMain items={navItems} currentPath={currentPath} />
      </SidebarContent>
    </Sidebar>
  );
}
