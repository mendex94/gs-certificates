'use client';

import Image from 'next/image';
import logo from '@assets/logo.svg';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@components/ui/button';
import { FileText, BarChart3 } from 'lucide-react';
import { useServerActionQuery } from '@lib/hooks/server-action-hooks';
import { getSessionAccess } from '@/app/action';

export default function Header() {
  const pathname = usePathname();
  const isAuthenticated = pathname !== '/';
  const { data: sessionAccess } = useServerActionQuery(getSessionAccess, {
    input: undefined,
    queryKey: ['getSessionAccess'],
  });

  return (
    <header className="via-[#18183b]/93 h-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand to-[#181a3d] p-4">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between">
        <Link href="/" prefetch={false}>
          <Image
            src={logo}
            alt="G&S Home Solutions Image Logo"
            className="max-w-[6.25rem]"
            draggable={false}
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 640px, 768px"
          />
        </Link>

        {isAuthenticated && (
          <nav className="flex items-center gap-2">
            <Link href="/certificados">
              <Button
                variant={pathname === '/certificados' ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center gap-2 text-white hover:bg-white/10"
              >
                <FileText className="h-4 w-4" />
                Certificados
              </Button>
            </Link>

            {sessionAccess?.isAdmin && (
              <Link href="/dashboard">
                <Button
                  variant={pathname === '/dashboard' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center gap-2 text-white hover:bg-white/10"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
