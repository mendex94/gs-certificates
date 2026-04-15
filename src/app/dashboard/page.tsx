'use client';

import { getDashboardStats } from './action';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Skeleton } from '@components/ui/skeleton';
import { FileText, Users, UserCheck, TrendingUp, Settings } from 'lucide-react';
import { useServerActionQuery } from '../_lib/hooks/server-action-hooks';

export default function DashboardPage() {
  const { isLoading, data: stats } = useServerActionQuery(getDashboardStats, {
    input: undefined,
    queryKey: ['getDashboardStats'],
  });

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    color,
  }: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    color: string;
  }) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value.toLocaleString('pt-BR')}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">{description}</p>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral dos certificados e usuários
            </p>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral dos certificados e usuários
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total de Certificados"
          value={stats?.totalCertificates || 0}
          icon={FileText}
          description="Certificados gerados no sistema"
          color="text-blue-600"
        />

        <StatCard
          title="Usuários com Certificados"
          value={stats?.uniqueUsersWithCertificates || 0}
          icon={UserCheck}
          description="Usuários que geraram certificados"
          color="text-green-600"
        />

        <StatCard
          title="Total de Usuários"
          value={stats?.totalUsers || 0}
          icon={Users}
          description="Usuários cadastrados no sistema"
          color="text-purple-600"
        />
      </div>

      {/* Additional Insights */}
      {stats && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                Taxa de Adoção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.totalUsers > 0
                    ? (
                        (stats.uniqueUsersWithCertificates / stats.totalUsers) *
                        100
                      ).toFixed(1)
                    : '0'}
                  %
                </div>
                <div className="text-muted-foreground text-sm">
                  ({stats.uniqueUsersWithCertificates.toLocaleString('pt-BR')}{' '}
                  de {stats.totalUsers.toLocaleString('pt-BR')})
                </div>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                Usuários que geraram pelo menos um certificado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Média por Usuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.uniqueUsersWithCertificates > 0
                  ? (
                      stats.totalCertificates /
                      stats.uniqueUsersWithCertificates
                    ).toFixed(1)
                  : '0'}
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                Certificados por usuário ativo
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-slate-700" />
                Administracao de tipos e templates
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-muted-foreground text-sm">
                Gerencie certificate types, upload/substituicao de templates e
                compatibilidade de armazenamento.
              </p>
              <Button asChild>
                <Link href="/dashboard/certificate-types">
                  Abrir gestao de templates
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
