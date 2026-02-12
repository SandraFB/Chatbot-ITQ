import { useState } from "react";
import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  Users, 
  CreditCard, 
  Phone, 
  Settings,
  FileText,
  FileStack,
  BarChart3 
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import tecnmLogo from "@/assets/logo-chatbot.png";

const mainItems = [
  { title: "Inicio", url: "/", icon: Home },
  { title: "Carreras", url: "/carreras", icon: BookOpen },
  { title: "Posgrados", url: "/posgrados", icon: GraduationCap },
  { title: "Admisión", url: "/admision", icon: Users },
  { title: "Becas", url: "/becas", icon: CreditCard },
  { title: "Documentos", url: "/documentos", icon: FileStack },
  { title: "Contacto", url: "/contacto", icon: Phone },
];

const adminItems = [
  { title: "Panel Admin", url: "/admin", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <img src={tecnmLogo} alt="TecNM Logo" className="h-10 w-10" />
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-sidebar-foreground">TecNM</h2>
              <p className="text-sm text-sidebar-foreground/80">Campus Querétaro</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <img src={tecnmLogo} alt="TecNM" className="h-8 w-8" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Administración</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}