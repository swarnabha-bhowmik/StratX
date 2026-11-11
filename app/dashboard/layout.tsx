import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import {AppSidebar} from "@/components/custom/Dashboard/AppSidebar"

const DashboardLayout = ({children}: any) => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger />
            <div className = "w-full">{children}</div>
        </SidebarProvider>
    )
}

export default DashboardLayout