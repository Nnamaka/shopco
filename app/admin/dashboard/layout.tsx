"use client";

import { AppSidebar } from "@/components/admin-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <AppSidebar currentPath={pathname} />
      <SidebarInset>
        {/* Top Header */}
        <header className="flex h-16 items-center gap-2 border-b bg-white shadow-sm">
          <SidebarTrigger className="" />
          <Separator orientation="vertical" className="h-6" />

          {/* Breadcrumbs */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin/dashboard/sales">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {(() => {
                    const lastPart =
                      pathname.replace("/admin/", "").split("/").pop() || "";
                    return (
                      lastPart.charAt(0).toUpperCase() +
                      lastPart.slice(1).toLowerCase()
                    );
                  })()}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Page Content */}
        <div className="flex flex-1 flex-col gap-4 p-6">
          {/* Main Page Section */}
          <div className="min-h-[80vh] rounded-xl bg-muted/50 p-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
