import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { retrieveCertificateById } from './action';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/app/_components/ui/skeleton';

const CertificateTemplate = dynamic(
  () => import('@/app/_components/templates/CertificateTemplate'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="flex justify-end space-x-4">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-[800px] w-full rounded-lg" />
      </div>
    ),
  },
);

export default async function Certificate({
  params,
}: {
  params: { certificateId: string };
}) {
  const [data] = await retrieveCertificateById({
    certificateId: params.certificateId,
  });

  if (!data?.certificate) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-screen-xl flex-col gap-4 px-4 py-4 sm:gap-6 sm:py-8 xl:px-0">
        <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-lg sm:p-6">
          <div>
            <div className="mb-4">
              <Link
                href="/certificados"
                className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-brand"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para certificados
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-red-500 sm:text-3xl">
              Certificado não encontrado
            </h1>
            <p className="mt-2 text-gray-600">
              O certificado que você está procurando não existe ou foi removido.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-screen-xl flex-col gap-4 px-4 py-4 sm:gap-6 sm:py-8 xl:px-0">
      {/* Header Section */}
      <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="mb-4">
            <Link
              href="/certificados"
              className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-brand"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para certificados
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Visualizar certificado
          </h1>
        </div>
      </div>

      {/* Certificate Preview Section */}
      <div className="rounded-lg bg-white p-3 shadow-lg sm:p-6">
        <CertificateTemplate
          certificate={data.certificate}
          certificateNumber={params.certificateId}
        />
      </div>
    </section>
  );
}
