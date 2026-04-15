import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { resolveDashboardAdminContext } from './_admin-auth';

type TDashboardLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function DashboardLayout({
  children,
}: TDashboardLayoutProps) {
  const adminContext = await resolveDashboardAdminContext();

  if (!adminContext) {
    redirect('/');
  }

  return children;
}
