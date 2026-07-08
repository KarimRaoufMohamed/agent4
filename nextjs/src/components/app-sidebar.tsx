import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Link from "next/link";
import screensJSON from "../../screens.json";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Screen, ScreensJSON } from "@/types/screens";
import { SignOutButton } from "@clerk/nextjs";
import { WorkflowNotifications } from "./workflow/workflow-notifications";

interface MenuItem {
  title: string;
  screenName: string;
  showInSidebar: boolean;
  icon: keyof typeof LucideIcons;
}

const items: MenuItem[] = (screensJSON as ScreensJSON).screens.map(
  (screen: Screen) => ({
    title: screen.screen_title,
    screenName: screen.screen_name,
    showInSidebar: screen.showInSidebar,
    icon: screen.icon as keyof typeof LucideIcons,
  })
);

export function AppSidebar() {
  const renderIcon = (iconName: keyof typeof LucideIcons) => {
    const IconComponent = LucideIcons[iconName] as LucideIcon;
    return IconComponent && <IconComponent size={20} />;
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <WorkflowNotifications />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(
                (item, index) =>
                  item.showInSidebar && (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={`/${item.screenName}`}
                          className="flex items-center gap-2"
                        >
                          {renderIcon(item.icon)}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Workflow Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="/workflows"
                    className="flex items-center gap-2"
                  >
                    <LucideIcons.Workflow size={20} />
                    <span>All Workflows</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="/workflow/instances"
                    className="flex items-center gap-2"
                  >
                    <LucideIcons.GitBranch size={20} />
                    <span>Workflow Instances</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <SignOutButton>
                <button className="flex items-center gap-2 w-full text-left">
                  <LucideIcons.LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </SignOutButton>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
