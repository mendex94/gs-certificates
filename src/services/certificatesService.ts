import { CertificateDTO, type Products } from '@/dtos/certificate';
import type { ICertificatesRepository, IUsersRepository } from '@/repositories';
import { CertificatesRepository } from '@/repositories/certificatesRepository';
import { type TokenType, UsersRepository } from '@/repositories/userRepository';
import { db, type DB } from '@/lib/db';
import {
  decrypt,
  encrypt,
  generateRandomToken,
  generateTokenHash,
} from '@/utils/crypto';
import { env } from '@/utils/env';
import { CertificatePdfService } from './certificatePdfService';

export class CertificatesService {
  private _certificatesRepository: ICertificatesRepository;
  private _usersRepository: IUsersRepository;
  private _certificatePdfService: CertificatePdfService;

  constructor() {
    this._certificatesRepository = new CertificatesRepository();
    this._usersRepository = new UsersRepository();
    this._certificatePdfService = new CertificatePdfService();
  }

  async createCertificate(certificate: {
    clientName: string;
    date: Date;
    companyName: string;
    technichalResponsible: string;
    userId: number;
    type: TokenType;
    product: Products;
  }) {
    const user = await this._usersRepository.findById(certificate.userId);

    if (!user) {
      throw new Error('User not found');
    }

    const certificateTokenQuantity =
      await this._usersRepository.findTokenBalance(
        certificate.userId,
        certificate.type,
      );

    if (!certificateTokenQuantity || certificateTokenQuantity.balance < 1) {
      throw new Error('User does not have enough tokens');
    }

    const encryptCertificateData = encrypt(
      JSON.stringify(certificate),
      env.JWT_SECRET,
    );

    const encryptedCertificateToken = generateRandomToken();

    const encryptedTokenHash = generateTokenHash(encryptedCertificateToken);

    await this._certificatesRepository.createCertificate(
      new CertificateDTO(
        encryptedTokenHash,
        encryptCertificateData,
        certificate.date,
        null,
        false,
        user.id,
        certificate.type,
        certificate.product,
      ),
    );

    return {
      certificateToken: encryptedCertificateToken,
    };
  }

  async retrieveCertificateById(certificateId: string) {
    const encryptedTokenHash = generateTokenHash(certificateId);

    const certificate =
      await this._certificatesRepository.retrieveCertificateById(
        encryptedTokenHash,
      );

    if (!certificate) {
      throw new Error('Certificate not found');
    }
    let decryptedData: {
      clientName: string;
      date: Date;
      companyName: string;
      technichalResponsible: string;
      type: TokenType;
      product: Products;
    };
    try {
      decryptedData = JSON.parse(
        decrypt(certificate.encryptedData, env.JWT_SECRET),
      );
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Failed to decrypt certificate data');
    }

    return decryptedData;
  }

  async generateCertificatePdf(certificateId: string, userId: number) {
    const encryptedTokenHash = generateTokenHash(certificateId);

    const certificate =
      await this._certificatesRepository.retrieveCertificateById(
        encryptedTokenHash,
      );

    if (!certificate) {
      throw new Error('Certificate not found');
    }

    if (certificate.userId !== userId) {
      throw new Error('Nao autorizado!');
    }

    let decryptedData: {
      clientName: string;
      date: Date;
      companyName: string;
      technichalResponsible: string;
      type: TokenType;
      product: Products;
    };

    try {
      decryptedData = JSON.parse(
        decrypt(certificate.encryptedData, env.JWT_SECRET),
      );
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Failed to decrypt certificate data');
    }

    const generatedPdf = await this._certificatePdfService.generate({
      certificateNumber: certificateId,
      ...decryptedData,
    });

    if (!certificate.tokenConsumed) {
      await db.transaction(async (tx) => {
        const certificatesRepository = new CertificatesRepository(tx as DB);
        const usersRepository = new UsersRepository(tx as DB);

        const tokenConsumed =
          await certificatesRepository.consumeGenerationToken(
            encryptedTokenHash,
            userId,
          );

        if (!tokenConsumed) {
          return;
        }

        const certificateTokenQuantity = await usersRepository.findTokenBalance(
          userId,
          certificate.type,
        );

        if (!certificateTokenQuantity || certificateTokenQuantity.balance < 1) {
          throw new Error('User does not have enough tokens');
        }

        await usersRepository.updateTokenBalance(
          userId,
          certificate.type,
          certificateTokenQuantity.balance - 1,
        );
      });
    }

    return generatedPdf;
  }
}
