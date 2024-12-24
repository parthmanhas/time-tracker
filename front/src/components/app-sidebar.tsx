import { BarChart2, BookOpen, Clock, LogOut, Settings, Tag, Target } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

// Menu items.
const items = [
    {
        title: "Timers",
        url: "/timers",
        icon: Clock,
    },
    {
        title: "Stats",
        url: "/stats",
        icon: BarChart2,
    },
    {
        title: "Tags",
        url: "/tags",
        icon: Tag,
    },
    {
        title: "Journal",
        url: "/journal",
        icon: BookOpen,
    },
    {
        title: "Goals",
        url: "/goals",
        icon: Target,
    },

]



export function AppSidebar() {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const handleLogout = () => {
        logout()
        navigate('/login')
    }
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
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
            <SidebarFooter>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem key="settings">
                                    <SidebarMenuButton asChild>
                                        <a href="/settings">
                                            <Settings />
                                            <span>Settings</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem key="logout">
                                    <SidebarMenuButton asChild>
                                        <button onClick={handleLogout}>
                                            <LogOut />
                                            <span>Logout</span>
                                        </button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </SidebarFooter>
        </Sidebar>
    )
}
