import type { TokenType } from '@/repositories/userRepository';

export const CERTIFICATE_PDF_FIELDS = {
  higienizacao: {
    certificateNumber: 'certificate_number',
    clientName: 'client_name',
    date: 'date',
    companyName: 'company_name',
    technichalResponsible: 'technichal_responsible',
  },
  impermeabilizacao: {
    certificateNumber: 'certificate_number',
    clientName: 'client_name',
    date: 'date',
    companyName: 'company_name',
    technichalResponsible: 'technichal_responsible',
    product: 'product',
  },
} as const;

export const REQUIRED_PDF_FIELDS_BY_TYPE: Record<TokenType, readonly string[]> =
  {
    higienizacao: [
      CERTIFICATE_PDF_FIELDS.higienizacao.certificateNumber,
      CERTIFICATE_PDF_FIELDS.higienizacao.clientName,
      CERTIFICATE_PDF_FIELDS.higienizacao.date,
      CERTIFICATE_PDF_FIELDS.higienizacao.companyName,
      CERTIFICATE_PDF_FIELDS.higienizacao.technichalResponsible,
    ],
    impermeabilizacao: [
      CERTIFICATE_PDF_FIELDS.impermeabilizacao.certificateNumber,
      CERTIFICATE_PDF_FIELDS.impermeabilizacao.clientName,
      CERTIFICATE_PDF_FIELDS.impermeabilizacao.date,
      CERTIFICATE_PDF_FIELDS.impermeabilizacao.companyName,
      CERTIFICATE_PDF_FIELDS.impermeabilizacao.technichalResponsible,
      CERTIFICATE_PDF_FIELDS.impermeabilizacao.product,
    ],
  };

export const CERTIFICATE_PDF_TEMPLATE_FILES: Record<TokenType, string> = {
  higienizacao: 'template-higienizacao.pdf',
  impermeabilizacao: 'template-impermeabilizacao.pdf',
};
