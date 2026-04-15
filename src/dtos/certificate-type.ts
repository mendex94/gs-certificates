import type {
  TCertificateManagementStatus,
  TTemplateMigrationState,
} from '@/constants/certificate-management';

export class CertificateTypeDTO {
  private _id: string;
  private _name: string;
  private _slug: string;
  private _description: string | null;
  private _legacyTokenType: string | null;
  private _status: TCertificateManagementStatus;
  private _currentTemplateId: string | null;
  private _migrationState: TTemplateMigrationState;
  private _createdByAdminId: number;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _archivedAt: Date | null;
  private _deletedAt: Date | null;

  constructor(data: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    legacyTokenType: string | null;
    status: TCertificateManagementStatus;
    currentTemplateId: string | null;
    migrationState: TTemplateMigrationState;
    createdByAdminId: number;
    createdAt: Date;
    updatedAt: Date;
    archivedAt: Date | null;
    deletedAt: Date | null;
  }) {
    this._id = data.id;
    this._name = data.name;
    this._slug = data.slug;
    this._description = data.description;
    this._legacyTokenType = data.legacyTokenType;
    this._status = data.status;
    this._currentTemplateId = data.currentTemplateId;
    this._migrationState = data.migrationState;
    this._createdByAdminId = data.createdByAdminId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._archivedAt = data.archivedAt;
    this._deletedAt = data.deletedAt;
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get slug() {
    return this._slug;
  }

  get description() {
    return this._description;
  }

  get legacyTokenType() {
    return this._legacyTokenType;
  }

  get status() {
    return this._status;
  }

  get currentTemplateId() {
    return this._currentTemplateId;
  }

  get migrationState() {
    return this._migrationState;
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
      name: this.name,
      slug: this.slug,
      description: this.description,
      legacyTokenType: this.legacyTokenType,
      status: this.status,
      currentTemplateId: this.currentTemplateId,
      migrationState: this.migrationState,
      createdByAdminId: this.createdByAdminId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      archivedAt: this.archivedAt,
      deletedAt: this.deletedAt,
    };
  }

  static fromDb(data: ConstructorParameters<typeof CertificateTypeDTO>[0]) {
    return new CertificateTypeDTO(data);
  }
}
