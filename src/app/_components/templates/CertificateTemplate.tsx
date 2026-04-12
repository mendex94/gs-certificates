'use client';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@components/ui/button';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
} from 'lucide-react';
import logo from '@assets/logo.svg';
import { generateCertificatePDF } from '@/app/certificados/[certificateId]/action';
import ShareButton from '@/app/_components/molecules/ShareButton';
import { Products } from '@/dtos/certificate';
import { CertificateType } from './DynamicTemplate';

type TCertificateTemplateProps = {
  certificate: {
    date: Date;
    clientName: string;
    companyName: string;
    technichalResponsible: string;
    product: Products;
    type: CertificateType;
  };
  certificateNumber: string;
};

const toArrayBuffer = (bytes: Uint8Array) => {
  const normalizedBytes = new Uint8Array(bytes.length);
  normalizedBytes.set(bytes);

  return normalizedBytes.buffer;
};

export default function CertificateTemplate({
  certificate,
  certificateNumber,
}: TCertificateTemplateProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdf, setPdf] = useState<Uint8Array | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [mobileFeedback, setMobileFeedback] = useState<string | null>(null);
  const { date, clientName, companyName, technichalResponsible, type } =
    certificate;

  useEffect(() => {
    if (!pdf) {
      setPdfPreviewUrl(null);
      return;
    }

    const blob = new Blob([toArrayBuffer(pdf)], { type: 'application/pdf' });
    const generatedUrl = window.URL.createObjectURL(blob);
    setPdfPreviewUrl(generatedUrl);

    return () => {
      window.URL.revokeObjectURL(generatedUrl);
    };
  }, [pdf]);

  const ensurePdf = useCallback(
    async (forceRegeneration = false) => {
      if (pdf && !forceRegeneration) {
        return pdf;
      }

      const [data, error] = await generateCertificatePDF({
        certificateId: certificateNumber,
      });

      if (error || !data) {
        setGenerationError(
          error?.message || 'Erro ao gerar PDF do certificado',
        );
        return null;
      }

      const generatedPdf = new Uint8Array(data.pdf);
      setPdf(generatedPdf);
      setGenerationError(null);

      return generatedPdf;
    },
    [certificateNumber, pdf],
  );

  const handleRetryPreview = async () => {
    try {
      setIsGenerating(true);
      setMobileFeedback(null);
      await ensurePdf(true);
    } catch (error) {
      console.error('Error retrying preview generation:', error);
      setGenerationError('Nao foi possivel atualizar a pre-visualizacao.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenInNewTab = () => {
    if (!pdfPreviewUrl) {
      return;
    }

    window.open(pdfPreviewUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      setMobileFeedback(null);
      const certificatePdf = await ensurePdf();

      if (!certificatePdf) {
        return;
      }

      const blob = new Blob([toArrayBuffer(certificatePdf)], {
        type: 'application/pdf',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${clientName}-certificado.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      setGenerationError('Nao foi possivel baixar o certificado.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    async function generatePDF() {
      try {
        setIsGenerating(true);
        await ensurePdf();
      } catch (error) {
        console.error('Error while generating pdf:', error);
        setGenerationError('Nao foi possivel carregar o PDF do certificado.');
      } finally {
        setIsGenerating(false);
      }
    }

    if (!pdf) {
      generatePDF();
    }
  }, [ensurePdf, pdf]);

  const getCertificateType = (type: CertificateType) => {
    if (type === 'impermeabilizacao') {
      return 'Impermeabilização';
    }
    return 'Higienização';
  };

  const getBackground = (type: CertificateType) => {
    if (type === 'impermeabilizacao') {
      return 'bg-gradient-to-br from-[#7ec9ff] via-[#0066a8] to-[#7ec9ff]';
    }
    return 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#3C43EA] to-[#101242]';
  };

  const previewReady = !!pdfPreviewUrl;
  const previewLoading = isGenerating && !previewReady;
  const previewError = !!generationError && !previewReady;

  return (
    <>
      <div className="pb-28 sm:pb-0">
        {/* Actions Section */}
        <div className="mb-6 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm sm:mb-8 sm:p-4">
          <div className="mt-3 hidden w-full flex-row gap-3 sm:flex sm:justify-end">
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              size="sm"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Baixar
            </Button>
            <ShareButton
              clientName={clientName}
              certificateId={certificateNumber}
              setPdf={setPdf}
              pdf={pdf}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              onShareFeedback={setMobileFeedback}
            />
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="relative w-full overflow-hidden rounded-lg bg-white shadow-lg">
          <div
            className={`flex w-full flex-col gap-6 ${getBackground(type)} p-4 text-white sm:gap-8 sm:p-12`}
          >
            <div className="flex flex-col items-center gap-3">
              <Image
                src={logo}
                alt="G&S Home Solutions Logo"
                width={70}
                height={70}
                className="size-20 w-auto sm:size-28"
                priority
              />
              <h1 className="text-center text-lg font-bold sm:text-xl md:text-2xl">
                Certificado de Garantia de {getCertificateType(type)}
              </h1>
              <p className="text-center text-sm font-bold sm:text-base">
                Revise o PDF final antes de enviar ao cliente.
              </p>
            </div>

            <div className="grid gap-2 rounded-lg border border-white/20 bg-black/20 p-3 text-xs sm:grid-cols-2 sm:gap-3 sm:p-4 sm:text-sm xl:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Cliente
                </p>
                <p className="font-semibold">{clientName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Data
                </p>
                <p className="font-semibold">
                  {new Date(date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Empresa
                </p>
                <p className="font-semibold">{companyName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Tecnico aplicador
                </p>
                <p className="font-semibold">{technichalResponsible}</p>
              </div>
            </div>

            <div className="rounded-lg border border-white/20 bg-white p-2 shadow-lg">
              {previewReady ? (
                <>
                  <div className="hidden sm:block">
                    <iframe
                      title="Pre-visualizacao do certificado"
                      src={pdfPreviewUrl}
                      className="h-[68vh] min-h-[520px] w-full rounded md:min-h-[720px]"
                    />
                  </div>

                  <div className="sm:hidden">
                    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded bg-slate-50 p-4 text-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                      <p className="text-sm font-semibold text-slate-800">
                        PDF pronto para visualizacao no celular.
                      </p>
                      <p className="text-xs text-slate-600">
                        Para melhor leitura, abra em tela cheia.
                      </p>
                      <Button
                        onClick={handleOpenInNewTab}
                        disabled={isGenerating}
                        size="sm"
                        className="w-full max-w-[260px] bg-brand text-white hover:bg-brand/90"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Abrir preview em tela cheia
                      </Button>
                    </div>
                  </div>
                </>
              ) : previewLoading ? (
                <div className="h-[58vh] min-h-[320px] w-full rounded bg-gray-100 p-4 sm:h-[68vh] sm:min-h-[480px] md:min-h-[720px]">
                  <div className="mb-4 h-5 w-1/3 animate-pulse rounded bg-gray-200" />
                  <div className="mb-3 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="mb-3 h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                  <div className="mb-3 h-4 w-5/6 animate-pulse rounded bg-gray-200" />
                  <div className="mt-6 flex h-[72%] items-center justify-center rounded bg-white p-2 text-center text-sm text-gray-500 shadow-inner sm:mt-8">
                    Gerando pre-visualizacao do PDF...
                  </div>
                </div>
              ) : previewError ? (
                <div className="flex h-[58vh] min-h-[320px] flex-col items-center justify-center gap-3 rounded bg-red-50 p-4 text-center sm:h-[68vh] sm:min-h-[480px] md:min-h-[720px]">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <p className="max-w-md text-sm font-semibold text-red-600">
                    {generationError}
                  </p>
                  <Button
                    onClick={handleRetryPreview}
                    disabled={isGenerating}
                    size="sm"
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : (
                <div className="flex h-[58vh] min-h-[320px] items-center justify-center rounded bg-gray-100 text-sm text-gray-500 sm:h-[68vh] sm:min-h-[480px] md:min-h-[720px]">
                  PDF indisponivel no momento
                </div>
              )}
            </div>
            {generationError && (
              <div className="flex flex-col justify-between gap-4 border-t border-white/20 pt-3">
                <p className="text-sm font-semibold text-yellow-200">
                  {generationError}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/40 bg-slate-950/95 px-3 pt-3 backdrop-blur sm:hidden"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
      >
        <div className="mx-auto flex w-full max-w-screen-sm items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
            <CheckCircle2 className="h-4 w-4" />
            Acoes rapidas
          </div>
        </div>

        <div className="mx-auto mt-2 flex w-full max-w-screen-sm items-start gap-2">
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            size="sm"
            className="h-10 flex-1 rounded-md bg-brand text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Baixar
          </Button>

          <ShareButton
            clientName={clientName}
            certificateId={certificateNumber}
            setPdf={setPdf}
            pdf={pdf}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
            containerClassName="w-full flex-1"
            className="h-10 w-full rounded-md"
            hideInlineError
            onShareFeedback={setMobileFeedback}
          />
        </div>

        {(generationError || mobileFeedback) && (
          <p className="mx-auto mt-2 w-full max-w-screen-sm text-xs font-medium text-amber-300">
            {generationError || mobileFeedback}
          </p>
        )}
      </div>
    </>
  );
}
