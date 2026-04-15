import {
  pgTable,
  pgEnum,
  serial,
  integer,
  uuid,
  varchar,
  timestamp,
  boolean,
  foreignKey,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {
  CERTIFICATE_MANAGEMENT_STATUS,
  TEMPLATE_MIGRATION_STATE,
  TEMPLATE_REFERENCE_REQUEST_STATUS,
  TEMPLATE_STORAGE_MODE,
} from '@/constants/certificate-management';

export const users = pgTable('user', {
  id: integer('id').primaryKey().notNull(),
  createdAt: timestamp('createdAt', {
    precision: 3,
    mode: 'date',
  }).defaultNow(),
  updatedAt: timestamp('updatedAt', {
    precision: 3,
    mode: 'date',
  }).defaultNow(),
});

export const certificateType = pgEnum('certificate_type', [
  'higienizacao',
  'impermeabilizacao',
]);

export const tokenBalance = pgTable(
  'token_balance',
  {
    id: serial('id').primaryKey().notNull(),
    type: certificateType().notNull().default('higienizacao'),
    balance: integer().default(0).notNull(),
    userId: integer('user_id').notNull(),
  },
  (table) => ({
    uniqUserType: unique().on(table.userId, table.type),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
  }),
);

export const products = pgEnum('products', [
  'Impertudo',
  'Safe',
  'Safe Tech',
  'Eco',
  'Tech Block',
]);

export const certificateManagementStatus = pgEnum(
  'certificate_management_status',
  [
    CERTIFICATE_MANAGEMENT_STATUS.ACTIVE,
    CERTIFICATE_MANAGEMENT_STATUS.INACTIVE,
    CERTIFICATE_MANAGEMENT_STATUS.ARCHIVED,
    CERTIFICATE_MANAGEMENT_STATUS.DELETED,
  ],
);

export const templateStorageMode = pgEnum('template_storage_mode', [
  TEMPLATE_STORAGE_MODE.DIRECT_UPLOAD,
  TEMPLATE_STORAGE_MODE.MANUAL_PUBLISH,
]);

export const templateMigrationState = pgEnum('template_migration_state', [
  TEMPLATE_MIGRATION_STATE.LEGACY_FALLBACK,
  TEMPLATE_MIGRATION_STATE.BACKFILLED,
]);

export const templateReferenceRequestStatus = pgEnum(
  'template_reference_request_status',
  [
    TEMPLATE_REFERENCE_REQUEST_STATUS.PENDING,
    TEMPLATE_REFERENCE_REQUEST_STATUS.PROCESSED,
    TEMPLATE_REFERENCE_REQUEST_STATUS.CANCELED,
  ],
);

export const certificateTypes = pgTable(
  'certificate_types',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    name: varchar('name', { length: 150 }).notNull(),
    slug: varchar('slug', { length: 150 }).notNull(),
    description: varchar('description', { length: 500 }),
    legacyTokenType: certificateType('legacy_token_type'),
    status: certificateManagementStatus('status')
      .notNull()
      .default(CERTIFICATE_MANAGEMENT_STATUS.ACTIVE),
    currentTemplateId: uuid('current_template_id'),
    migrationState: templateMigrationState('migration_state')
      .notNull()
      .default(TEMPLATE_MIGRATION_STATE.LEGACY_FALLBACK),
    migrationCutoffAt: timestamp('migration_cutoff_at', {
      precision: 3,
      mode: 'date',
    }),
    backfillCompletedAt: timestamp('backfill_completed_at', {
      precision: 3,
      mode: 'date',
    }),
    createdByAdminId: integer('created_by_admin_id').notNull(),
    createdAt: timestamp('created_at', {
      precision: 3,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),
    archivedAt: timestamp('archived_at', {
      precision: 3,
      mode: 'date',
    }),
    deletedAt: timestamp('deleted_at', {
      precision: 3,
      mode: 'date',
    }),
  },
  (table) => ({
    slugUnique: unique().on(table.slug),
    nameIdx: index('certificate_types_name_idx').on(table.name),
    statusIdx: index('certificate_types_status_idx').on(table.status),
    adminFk: foreignKey({
      columns: [table.createdByAdminId],
      foreignColumns: [users.id],
    }),
  }),
);

export const certificateTemplates = pgTable(
  'certificate_templates',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    certificateTypeId: uuid('certificate_type_id').notNull(),
    version: integer('version').notNull(),
    originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
    storagePath: varchar('storage_path', { length: 255 }).notNull(),
    storageMode: templateStorageMode('storage_mode')
      .notNull()
      .default(TEMPLATE_STORAGE_MODE.DIRECT_UPLOAD),
    mimeType: varchar('mime_type', { length: 80 }).notNull(),
    fileSizeBytes: integer('file_size_bytes').notNull(),
    status: certificateManagementStatus('status')
      .notNull()
      .default(CERTIFICATE_MANAGEMENT_STATUS.ACTIVE),
    createdByAdminId: integer('created_by_admin_id').notNull(),
    createdAt: timestamp('created_at', {
      precision: 3,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),
    archivedAt: timestamp('archived_at', {
      precision: 3,
      mode: 'date',
    }),
    deletedAt: timestamp('deleted_at', {
      precision: 3,
      mode: 'date',
    }),
  },
  (table) => ({
    typeVersionUnique: unique().on(table.certificateTypeId, table.version),
    typeStatusIdx: index('certificate_templates_type_status_idx').on(
      table.certificateTypeId,
      table.status,
    ),
    typeFk: foreignKey({
      columns: [table.certificateTypeId],
      foreignColumns: [certificateTypes.id],
    }),
    adminFk: foreignKey({
      columns: [table.createdByAdminId],
      foreignColumns: [users.id],
    }),
  }),
);

export const certificatePendingRequests = pgTable(
  'certificate_pending_requests',
  {
    id: serial('id').primaryKey().notNull(),
    certificateTypeId: uuid('certificate_type_id'),
    templateId: uuid('template_id'),
    status: templateReferenceRequestStatus('status')
      .notNull()
      .default(TEMPLATE_REFERENCE_REQUEST_STATUS.PENDING),
    createdAt: timestamp('created_at', {
      precision: 3,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    typeStatusIdx: index('certificate_pending_requests_type_status_idx').on(
      table.certificateTypeId,
      table.status,
    ),
    templateStatusIdx: index(
      'certificate_pending_requests_template_status_idx',
    ).on(table.templateId, table.status),
    typeFk: foreignKey({
      columns: [table.certificateTypeId],
      foreignColumns: [certificateTypes.id],
    }),
    templateFk: foreignKey({
      columns: [table.templateId],
      foreignColumns: [certificateTemplates.id],
    }),
  }),
);

export const certificates = pgTable(
  'certificate',
  {
    tokenHash: varchar('tokenHash', { length: 64 }).primaryKey().notNull(),
    encryptedData: varchar('encryptedData', { length: 1000 }).notNull(),
    issuedAt: timestamp('issuedAt', { precision: 3, mode: 'date' }).notNull(),
    generatedAt: timestamp('generatedAt', { precision: 3, mode: 'date' }),
    tokenConsumed: boolean('tokenConsumed').default(false).notNull(),
    userId: integer('user_id').notNull(),
    type: certificateType().default('higienizacao').notNull(),
    product: products(),
    certificateTypeId: uuid('certificate_type_id'),
    templateId: uuid('template_id'),
  },
  (table) => ({
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
    certificateTypeFk: foreignKey({
      columns: [table.certificateTypeId],
      foreignColumns: [certificateTypes.id],
    }),
    templateFk: foreignKey({
      columns: [table.templateId],
      foreignColumns: [certificateTemplates.id],
    }),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  certificates: many(certificates),
  tokenBalances: many(tokenBalance),
}));

export const tokenBalanceRelations = relations(tokenBalance, ({ one }) => ({
  user: one(users, {
    fields: [tokenBalance.userId],
    references: [users.id],
  }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id],
  }),
  certificateType: one(certificateTypes, {
    fields: [certificates.certificateTypeId],
    references: [certificateTypes.id],
  }),
  template: one(certificateTemplates, {
    fields: [certificates.templateId],
    references: [certificateTemplates.id],
  }),
}));

export const certificateTypesRelations = relations(
  certificateTypes,
  ({ one, many }) => ({
    createdBy: one(users, {
      fields: [certificateTypes.createdByAdminId],
      references: [users.id],
    }),
    templates: many(certificateTemplates),
  }),
);

export const certificateTemplatesRelations = relations(
  certificateTemplates,
  ({ one }) => ({
    certificateType: one(certificateTypes, {
      fields: [certificateTemplates.certificateTypeId],
      references: [certificateTypes.id],
    }),
    createdBy: one(users, {
      fields: [certificateTemplates.createdByAdminId],
      references: [users.id],
    }),
  }),
);
