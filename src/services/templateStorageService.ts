import { access, mkdir, unlink, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { dirname, join, normalize, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  CERTIFICATE_MANAGEMENT_ERRORS,
  TEMPLATE_ALLOWED_EXTENSION,
  TEMPLATE_ALLOWED_MIME_TYPE,
  TEMPLATE_MAX_FILE_SIZE_BYTES,
  TEMPLATE_STORAGE_MODE,
  TEMPLATE_STORAGE_ROOT_SEGMENT,
  type TTemplateStorageMode,
} from '@/constants/certificate-management';
import { getTemplateStorageModeOverride } from '@/utils/env';

export type TTemplateUploadFile = {
  name: string;
  size: number;
  type: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export type TStorageCompatibilityStatus = {
  isWritable: boolean;
  mode: TTemplateStorageMode;
  checkedAt: string;
  reason?: string;
};

export class TemplateStorageService {
  private readonly rootFolder = join(
    process.cwd(),
    'public',
    TEMPLATE_STORAGE_ROOT_SEGMENT,
  );

  private resolveSafeTypeSegment(certificateTypeId: string) {
    return certificateTypeId.replace(/[^a-zA-Z0-9-_]/g, '');
  }

  private assertPathInsideRoot(absolutePath: string) {
    const normalizedRoot = `${normalize(this.rootFolder)}${sep}`;
    const normalizedTarget = normalize(absolutePath);

    if (!normalizedTarget.startsWith(normalizedRoot)) {
      throw new Error(CERTIFICATE_MANAGEMENT_ERRORS.INVALID_FILE_TYPE);
    }
  }

  private isPdfSignature(buffer: Uint8Array) {
    return (
      buffer.length >= 5 &&
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46 &&
      buffer[4] === 0x2d
    );
  }

  async validateTemplateFile(file: TTemplateUploadFile) {
    const isMimeTypeValid = file.type === TEMPLATE_ALLOWED_MIME_TYPE;
    const hasPdfExtension = file.name
      .toLowerCase()
      .endsWith(TEMPLATE_ALLOWED_EXTENSION);

    if (!isMimeTypeValid || !hasPdfExtension) {
      throw new Error(CERTIFICATE_MANAGEMENT_ERRORS.INVALID_FILE_TYPE);
    }

    if (file.size > TEMPLATE_MAX_FILE_SIZE_BYTES) {
      throw new Error(CERTIFICATE_MANAGEMENT_ERRORS.FILE_TOO_LARGE);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());

    if (!this.isPdfSignature(bytes)) {
      throw new Error(CERTIFICATE_MANAGEMENT_ERRORS.INVALID_FILE_TYPE);
    }

    return {
      mimeType: file.type,
      fileSizeBytes: file.size,
      bytes,
    };
  }

  async getTemplateStorageCompatibility(): Promise<TStorageCompatibilityStatus> {
    const overrideMode = getTemplateStorageModeOverride();

    if (overrideMode === TEMPLATE_STORAGE_MODE.MANUAL_PUBLISH) {
      return {
        isWritable: false,
        mode: TEMPLATE_STORAGE_MODE.MANUAL_PUBLISH,
        checkedAt: new Date().toISOString(),
        reason: 'Storage mode override active',
      };
    }

    if (overrideMode === TEMPLATE_STORAGE_MODE.DIRECT_UPLOAD) {
      return {
        isWritable: true,
        mode: TEMPLATE_STORAGE_MODE.DIRECT_UPLOAD,
        checkedAt: new Date().toISOString(),
      };
    }

    try {
      await mkdir(this.rootFolder, { recursive: true });
      const probeFile = join(
        this.rootFolder,
        `.storage-probe-${randomUUID()}.tmp`,
      );

      await writeFile(probeFile, 'ok', { encoding: 'utf-8' });
      await access(probeFile, fsConstants.W_OK);
      await unlink(probeFile);

      return {
        isWritable: true,
        mode: TEMPLATE_STORAGE_MODE.DIRECT_UPLOAD,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        isWritable: false,
        mode: TEMPLATE_STORAGE_MODE.MANUAL_PUBLISH,
        checkedAt: new Date().toISOString(),
        reason:
          error instanceof Error ? error.message : 'Writable check failed',
      };
    }
  }

  buildTemplatePath(certificateTypeId: string, templateId?: string) {
    const resolvedTemplateId = templateId || randomUUID();
    const safeTypeSegment = this.resolveSafeTypeSegment(certificateTypeId);
    const absolutePath = join(
      this.rootFolder,
      safeTypeSegment,
      `${resolvedTemplateId}${TEMPLATE_ALLOWED_EXTENSION}`,
    );

    this.assertPathInsideRoot(absolutePath);

    return {
      templateId: resolvedTemplateId,
      storagePath: `/public/${TEMPLATE_STORAGE_ROOT_SEGMENT}/${safeTypeSegment}/${resolvedTemplateId}${TEMPLATE_ALLOWED_EXTENSION}`,
      absolutePath,
    };
  }

  async persistTemplateFile(input: {
    certificateTypeId: string;
    file: TTemplateUploadFile;
    templateId?: string;
  }) {
    const compatibility = await this.getTemplateStorageCompatibility();

    if (compatibility.mode !== TEMPLATE_STORAGE_MODE.DIRECT_UPLOAD) {
      throw new Error(
        CERTIFICATE_MANAGEMENT_ERRORS.PUBLIC_STORAGE_NOT_WRITABLE,
      );
    }

    const fileValidation = await this.validateTemplateFile(input.file);
    const pathResolution = this.buildTemplatePath(
      input.certificateTypeId,
      input.templateId,
    );

    await mkdir(dirname(pathResolution.absolutePath), { recursive: true });
    await writeFile(pathResolution.absolutePath, fileValidation.bytes);

    return {
      templateId: pathResolution.templateId,
      storagePath: pathResolution.storagePath,
      absolutePath: pathResolution.absolutePath,
      mimeType: fileValidation.mimeType,
      fileSizeBytes: fileValidation.fileSizeBytes,
      storageMode: TEMPLATE_STORAGE_MODE.DIRECT_UPLOAD,
    };
  }

  async removeTemplateFile(storagePath: string) {
    const normalizedStoragePath = storagePath.startsWith('/public/')
      ? storagePath.replace('/public/', '')
      : storagePath.replace(/^\//, '');
    const absolutePath = join(process.cwd(), 'public', normalizedStoragePath);

    this.assertPathInsideRoot(absolutePath);

    try {
      await unlink(absolutePath);
    } catch {
      return false;
    }

    return true;
  }

  async classifyValidTemplateUploadAttempt(input: {
    isAuthenticated: boolean;
    mode: TTemplateStorageMode;
    certificateTypeExists: boolean;
    file: TTemplateUploadFile | null;
  }) {
    if (!input.isAuthenticated) {
      return false;
    }

    if (input.mode !== TEMPLATE_STORAGE_MODE.DIRECT_UPLOAD) {
      return false;
    }

    if (!input.certificateTypeExists || !input.file) {
      return false;
    }

    try {
      await this.validateTemplateFile(input.file);
      return true;
    } catch {
      return false;
    }
  }
}
