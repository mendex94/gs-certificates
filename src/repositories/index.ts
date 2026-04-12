/* eslint-disable no-unused-vars */
import { CertificateDTO } from '@/dtos/certificate';

export interface ICertificatesRepository {
  createCertificate(certificate: CertificateDTO): Promise<CertificateDTO>;
  retrieveCertificateById(
    certificateId: string,
  ): Promise<CertificateDTO | null>;
  consumeGenerationToken(
    certificateId: string,
    userId: number,
  ): Promise<boolean>;
}

export interface IUsersRepository {
  createUser(userId: number): Promise<{ id: number }>;
  findById(userId: number): Promise<{ id: number }>;
  findTokenBalancesByUserId(
    userId: number,
  ): Promise<{ type: string; balance: number }[]>;
  findTokenBalance(
    userId: number,
    type: string,
  ): Promise<{ userId: number; type: string; balance: number }>;
  createTokenBalance(
    userId: number,
    type: string,
    balance: number,
  ): Promise<void>;
  updateTokenBalance(
    userId: number,
    type: string,
    balance: number,
  ): Promise<void>;
}

export interface IDashboardRepository {
  getTotalCertificates(): Promise<number>;
  getUniqueUsersWithCertificates(): Promise<number>;
  getTotalUsers(): Promise<number>;
}
