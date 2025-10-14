import { LayoutDashboard, Building2, MapPin, Bell, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
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

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    testId: "link-dashboard",
  },
  {
    title: "Hik-Connect Settings",
    url: "/hik-connect",
    icon: Settings,
    testId: "link-hik-connect",
  },
  {
    title: "Branch List",
    url: "/branches",
    icon: Building2,
    testId: "link-branches",
  },
  {
    title: "Device Mapping",
    url: "/device-mapping",
    icon: MapPin,
    testId: "link-device-mapping",
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
    testId: "link-notifications",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hik-Connect Monitor</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={item.testId}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
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
