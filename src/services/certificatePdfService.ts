import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PDFDocument } from 'pdf-lib';
import {
  CERTIFICATE_PDF_FIELDS,
  CERTIFICATE_PDF_TEMPLATE_FILES,
  REQUIRED_PDF_FIELDS_BY_TYPE,
} from '@/constants/certificate-pdf-fields';
import type { Products } from '@/dtos/certificate';
import type { TokenType } from '@/repositories/userRepository';
import { CertificateTemplatesRepository } from '@/repositories/certificateTemplatesRepository';
import { CERTIFICATE_MANAGEMENT_ERRORS } from '@/constants/certificate-management';
import { isLegacyFallbackCutoffReached } from '@/utils/env';

type TGenerateCertificatePdfInput = {
  certificateNumber: string;
  type: TokenType;
  clientName: string;
  date: Date;
  companyName: string;
  technichalResponsible: string;
  product: Products;
};

export class CertificatePdfService {
  private certificateTemplatesRepository: CertificateTemplatesRepository;

  constructor() {
    this.certificateTemplatesRepository = new CertificateTemplatesRepository();
  }

  private async loadTemplateFromMetadata(type: TokenType) {
    const activeTemplateByLegacyType =
      await this.certificateTemplatesRepository.findLatestActiveByLegacyTokenType(
        type,
      );

    if (!activeTemplateByLegacyType) {
      return null;
    }

    const normalizedStoragePath = activeTemplateByLegacyType.storagePath
      .replace(/^\/public\//, '')
      .replace(/^\//, '');
    const absolutePath = join(process.cwd(), 'public', normalizedStoragePath);

    try {
      return await readFile(absolutePath);
    } catch {
      return null;
    }
  }

  private async loadTemplateByType(type: TokenType) {
    const metadataTemplate = await this.loadTemplateFromMetadata(type);

    if (metadataTemplate) {
      return metadataTemplate;
    }

    if (isLegacyFallbackCutoffReached()) {
      throw new Error(
        CERTIFICATE_MANAGEMENT_ERRORS.BACKFILL_INCOMPLETE_AT_CUTOFF,
      );
    }

    const templateFileName = CERTIFICATE_PDF_TEMPLATE_FILES[type];
    const templatePath = join(process.cwd(), 'public', templateFileName);

    try {
      return await readFile(templatePath);
    } catch {
      throw new Error(
        `Template PDF nao encontrado na pasta public: ${templateFileName}`,
      );
    }
  }

  private resolveRequiredFieldValue(
    input: TGenerateCertificatePdfInput,
    fieldName: string,
  ) {
    const higienizacaoFields = CERTIFICATE_PDF_FIELDS.higienizacao;
    const impermeabilizacaoFields = CERTIFICATE_PDF_FIELDS.impermeabilizacao;
    const formattedDate = format(
      new Date(input.date),
      "dd 'de' MMMM 'de' yyyy",
      {
        locale: ptBR,
      },
    );

    const commonFieldValueMap: Record<string, string> = {
      [higienizacaoFields.certificateNumber]: input.certificateNumber,
      [higienizacaoFields.clientName]: input.clientName,
      [higienizacaoFields.date]: formattedDate,
      [higienizacaoFields.companyName]: input.companyName,
      [higienizacaoFields.technichalResponsible]: input.technichalResponsible,
    };

    if (fieldName === impermeabilizacaoFields.product) {
      return input.product || '';
    }

    return commonFieldValueMap[fieldName] || '';
  }

  private setFieldValueOrFail(
    form: ReturnType<PDFDocument['getForm']>,
    fieldName: string,
    value: string,
  ) {
    try {
      const textField = form.getTextField(fieldName);
      textField.setText(value);
    } catch {
      throw new Error(`Campo obrigatorio do template ausente: ${fieldName}`);
    }
  }

  async generate(input: TGenerateCertificatePdfInput) {
    const templateBytes = await this.loadTemplateByType(input.type);
    const templatePdfBytes = new Uint8Array(templateBytes);
    const pdfDoc = await PDFDocument.load(templatePdfBytes);
    const form = pdfDoc.getForm();
    const requiredFields = REQUIRED_PDF_FIELDS_BY_TYPE[input.type];

    requiredFields.forEach((fieldName) => {
      const resolvedFieldValue = this.resolveRequiredFieldValue(
        input,
        fieldName,
      );

      if (!resolvedFieldValue.trim()) {
        throw new Error(`Campo obrigatorio sem valor: ${fieldName}`);
      }

      this.setFieldValueOrFail(form, fieldName, resolvedFieldValue);
    });

    form.flatten();

    return pdfDoc.save();
  }
}
