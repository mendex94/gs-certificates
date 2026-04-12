/* eslint-disable @typescript-eslint/no-explicit-any */
import { Share } from 'lucide-react';
import { Button } from '@components/ui/button';
import { generateCertificatePDF } from '@/app/certificados/[certificateId]/action';
import { Dispatch, SetStateAction, useState } from 'react';
import { cn } from '@lib/utils';

type TShareButtonProps = {
  clientName: string;
  certificateId: string;
  setPdf: Dispatch<SetStateAction<Uint8Array | null>>;
  pdf: Uint8Array | null;
  isGenerating: boolean;
  setIsGenerating: Dispatch<SetStateAction<boolean>>;
  className?: string;
  containerClassName?: string;
  hideInlineError?: boolean;
  onShareFeedback?: Dispatch<SetStateAction<string | null>>;
};

export default function ShareButton({
  clientName,
  certificateId,
  setPdf,
  pdf,
  isGenerating,
  setIsGenerating,
  className,
  containerClassName,
  hideInlineError = false,
  onShareFeedback,
}: TShareButtonProps) {
  const [shareError, setShareError] = useState<string | null>(null);

  const toArrayBuffer = (bytes: Uint8Array) => {
    const normalizedBytes = new Uint8Array(bytes.length);
    normalizedBytes.set(bytes);

    return normalizedBytes.buffer;
  };

  const handleShare = async () => {
    let preparedPdfData = pdf;

    try {
      setIsGenerating(true);
      setShareError(null);
      onShareFeedback?.(null);

      if (!preparedPdfData) {
        const [data, error] = await generateCertificatePDF({
          certificateId,
        });

        if (error || !data) {
          console.error('Error generating certificate pdf:', error);
          const message = 'Nao foi possivel preparar o PDF para compartilhar.';
          setShareError(message);
          onShareFeedback?.(message);
          return;
        }

        preparedPdfData = new Uint8Array(data.pdf);
        setPdf(preparedPdfData);
      }

      const blob = new Blob([toArrayBuffer(preparedPdfData)], {
        type: 'application/pdf',
      });

      const file = new File([blob], `${clientName}-certificado.pdf`, {
        type: 'application/pdf',
        lastModified: new Date().getTime(),
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Certificado de Garantia',
            text: `Certificado de garantia para ${clientName}`,
          });
        } catch (shareError: any) {
          console.error('Share failed:', shareError);

          if (shareError.name === 'NotAllowedError') {
            console.log('User canceled share operation');
          } else {
            throw shareError;
          }
        }
      } else {
        throw new Error('share_not_supported');
      }
    } catch (error: any) {
      console.error('Error sharing certificate:', error);

      const shareFailedMessage =
        error?.message === 'share_not_supported'
          ? 'Seu navegador nao suporta compartilhamento direto. O PDF foi baixado para envio manual.'
          : 'Nao foi possivel compartilhar o certificado agora.';

      if (preparedPdfData) {
        const blob = new Blob([toArrayBuffer(preparedPdfData)], {
          type: 'application/pdf',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${clientName}-certificado.pdf`;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      }

      setShareError(shareFailedMessage);
      onShareFeedback?.(shareFailedMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={cn('flex flex-col', containerClassName)}>
      <Button
        onClick={handleShare}
        disabled={isGenerating}
        size="sm"
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        {isGenerating ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Share className="h-4 w-4" />
        )}
        Compartilhar
      </Button>

      {shareError && !hideInlineError && (
        <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs font-medium text-amber-700">
          {shareError}
        </div>
      )}
    </div>
  );
}
