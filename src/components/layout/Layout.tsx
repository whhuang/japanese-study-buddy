import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { BackButton } from '@/components/common/BackButton';
import { AppSidebar } from "./Sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main className="w-full">
        <div className="flex gap-4">
          <BackButton />
          <div className="grow mt-0.5">
            <Outlet />
          </div>
          <SidebarTrigger side="right"/>
        </div>
        {children}
      </main>
    </SidebarProvider>
  )
}
