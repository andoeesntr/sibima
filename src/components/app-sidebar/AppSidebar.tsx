
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { studentMenuItems } from "./studentMenuItems";
import { coordinatorMenuItems } from "./coordinatorMenuItems";
import { useAuth } from "@/contexts/AuthContext";

export function AppSidebar() {
  // Dapatkan role user untuk menampilkan menu sesuai role
  const { user } = useAuth();
  const role = user?.role; // "student", "coordinator", etc

  let items = [];
  if (role === "student") {
    items = studentMenuItems;
  } else if (role === "coordinator") {
    items = coordinatorMenuItems;
  }
  // ...tambahkan handling untuk role lain jika perlu

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
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
