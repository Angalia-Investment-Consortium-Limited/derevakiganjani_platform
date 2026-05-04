import type { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  // Now simply acts as a passthrough component for backward compatibility.
  // The actual layout wrapper is implemented in App.tsx using AdminLayoutRoot.
  return <>{children}</>;
}
