import type {
  TCertificateManagementStatus,
  TTemplateStorageMode,
} from '@/constants/certificate-management';

export class CertificateTemplateDTO {
  private _id: string;
  private _certificateTypeId: string;
  private _version: number;
  private _originalFileName: string;
  private _storagePath: string;
  private _storageMode: TTemplateStorageMode;
  private _mimeType: string;
  private _fileSizeBytes: number;
  private _status: TCertificateManagementStatus;
  private _createdByAdminId: number;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _archivedAt: Date | null;
  private _deletedAt: Date | null;

  constructor(data: {
    id: string;
    certificateTypeId: string;
    version: number;
    originalFileName: string;
    storagePath: string;
    storageMode: TTemplateStorageMode;
    mimeType: string;
    fileSizeBytes: number;
    status: TCertificateManagementStatus;
    createdByAdminId: number;
    createdAt: Date;
    updatedAt: Date;
    archivedAt: Date | null;
    deletedAt: Date | null;
  }) {
    this._id = data.id;
    this._certificateTypeId = data.certificateTypeId;
    this._version = data.version;
    this._originalFileName = data.originalFileName;
    this._storagePath = data.storagePath;
    this._storageMode = data.storageMode;
    this._mimeType = data.mimeType;
    this._fileSizeBytes = data.fileSizeBytes;
    this._status = data.status;
    this._createdByAdminId = data.createdByAdminId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._archivedAt = data.archivedAt;
    this._deletedAt = data.deletedAt;
  }

  get id() {
    return this._id;
  }

  get certificateTypeId() {
    return this._certificateTypeId;
  }

  get version() {
    return this._version;
  }

  get originalFileName() {
    return this._originalFileName;
  }

  get storagePath() {
    return this._storagePath;
  }

  get storageMode() {
    return this._storageMode;
  }

  get mimeType() {
    return this._mimeType;
  }

  get fileSizeBytes() {
    return this._fileSizeBytes;
  }

  get status() {
    return this._status;
  }

  get createdByAdminId() {
    return this._createdByAdminId;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  get archivedAt() {
    return this._archivedAt;
  }

  get deletedAt() {
    return this._deletedAt;
  }

  toJSON() {
    return {
      id: this.id,
      certificateTypeId: this.certificateTypeId,
      version: this.version,
      originalFileName: this.originalFileName,
      storagePath: this.storagePath,
      storageMode: this.storageMode,
      mimeType: this.mimeType,
      fileSizeBytes: this.fileSizeBytes,
      status: this.status,
      createdByAdminId: this.createdByAdminId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      archivedAt: this.archivedAt,
      deletedAt: this.deletedAt,
    };
  }

  static fromDb(data: ConstructorParameters<typeof CertificateTemplateDTO>[0]) {
    return new CertificateTemplateDTO(data);
  }
}
