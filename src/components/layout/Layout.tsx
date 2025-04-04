import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./Sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main className="w-full">
        <div className="flex">
          <div className="grow">
            <Outlet />
          </div>
          <SidebarTrigger />
        </div>
        {children}
      </main>
    </SidebarProvider>
  )
}
