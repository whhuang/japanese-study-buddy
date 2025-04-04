import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { NavButton } from '@/components/common/NavButton';
import { AppSidebar } from "./Sidebar"
import { Home } from "lucide-react"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main className="w-full">
        <div className="flex gap-4">
          <NavButton to="/" variant="ghost" buttonClassName="size-7">
            <Home />
          </NavButton>
          <div className="grow">
            <Outlet />
          </div>
          <SidebarTrigger side="right"/>
        </div>
        {children}
      </main>
    </SidebarProvider>
  )
}
