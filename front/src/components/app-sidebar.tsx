import { BarChart2, BookOpen, Clock, LogOut, Settings, Tag, Target } from "lucide-react"
import { cn } from "@/lib/utils"
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
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Separator } from "./ui/separator"

const items = [
    {
        title: "Timers",
        url: "/timers",
        icon: Clock,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
    },
    {
        title: "Stats",
        url: "/stats",
        icon: BarChart2,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
    },
    {
        title: "Tags",
        url: "/tags",
        icon: Tag,
        color: "text-green-600",
        bgColor: "bg-green-100",
    },
    {
        title: "Journal",
        url: "/journal",
        icon: BookOpen,
        color: "text-amber-600",
        bgColor: "bg-amber-100",
    },
    {
        title: "Goals",
        url: "/goals",
        icon: Target,
        color: "text-red-600",
        bgColor: "bg-red-100",
    },
]

export function AppSidebar() {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <Sidebar className="border-r bg-gradient-to-b from-white to-slate-50">
            <SidebarContent className="p-4">
                <div className="flex items-center gap-2 px-4 py-2 mb-6">
                    <Clock className="h-6 w-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-slate-800">TimeTrack</h2>
                </div>
                <SidebarGroup>
                    <SidebarGroupLabel className="px-4 text-sm font-medium text-slate-500">
                        Menu
                    </SidebarGroupLabel>
                    <Separator className="my-2" />
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const isActive = location.pathname === item.url
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton 
                                            className={cn(
                                                "text-base gap-3 px-4 py-2 rounded-lg transition-all duration-200",
                                                isActive 
                                                    ? "bg-slate-100 text-slate-900 font-medium"
                                                    : "text-slate-600 hover:bg-slate-100"
                                            )} 
                                            asChild
                                        >
                                            <a href={item.url} className="flex items-center gap-3">
                                                <div className={cn("p-2 rounded-md", item.bgColor)}>
                                                    <item.icon className={cn("h-4 w-4", item.color)} />
                                                </div>
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t bg-slate-50">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton 
                                        className="text-base gap-3 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all duration-200" 
                                        asChild
                                    >
                                        <a href="/settings" className="flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-slate-200">
                                                <Settings className="h-4 w-4 text-slate-600" />
                                            </div>
                                            <span>Settings</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton 
                                        className="text-base gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200" 
                                        asChild
                                    >
                                        <button onClick={handleLogout} className="flex items-center gap-3 w-full">
                                            <div className="p-2 rounded-md bg-red-100">
                                                <LogOut className="h-4 w-4 text-red-600" />
                                            </div>
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
