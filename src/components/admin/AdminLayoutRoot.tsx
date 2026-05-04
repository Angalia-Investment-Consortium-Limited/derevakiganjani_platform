import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { AdminBreadcrumbs } from './AdminBreadcrumbs';
import { Outlet } from 'react-router-dom';
import { useAdminMovementTracker } from '@/hooks/useAdminMovement';

export function AdminLayoutRoot() {
  useAdminMovementTracker();

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <AdminTopBar />
          
          <div className="border-b bg-background">
            <div className="px-6 py-3">
              <AdminBreadcrumbs />
            </div>
          </div>
          
          <main className="flex-1 p-6 bg-muted/20">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
