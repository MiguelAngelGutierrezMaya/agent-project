import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import { SocialConfig } from '@modules/config/domain/models/SocialConfig';

export class SocialConfigDTO {
  constructor(
    public readonly id: string,
    public readonly whatsappNumber: string,
    public readonly whatsappAccessToken: string,
    public readonly whatsappBusinessPhoneId: string,
    public readonly whatsappDisplayPhone: string,
    public readonly facebookEndpoint: string,
    public readonly whatsappApiVersion: string,
    public readonly facebookPageUrl: string,
    public readonly instagramPageUrl: string,
    public readonly whatsappListDescription: string,
    public readonly whatsappButtonOptionsTitle: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    data: Record<string, string | Date>
  ): [SocialConfigDTO?, DomainValidationError?] {
    const {
      id,
      whatsappNumber,
      whatsappAccessToken,
      whatsappBusinessPhoneId,
      whatsappDisplayPhone,
      facebookEndpoint,
      whatsappApiVersion,
      facebookPageUrl,
      instagramPageUrl,
      whatsappListDescription,
      whatsappButtonOptionsTitle,
      createdAt,
      updatedAt,
    } = data;

    if (
      !id ||
      !whatsappNumber ||
      !whatsappAccessToken ||
      !whatsappBusinessPhoneId ||
      !whatsappDisplayPhone ||
      !facebookEndpoint ||
      !whatsappApiVersion ||
      !facebookPageUrl ||
      !instagramPageUrl ||
      !whatsappListDescription ||
      !whatsappButtonOptionsTitle ||
      !createdAt ||
      !updatedAt
    ) {
      return [
        undefined,
        new DomainValidationError('Invalid social config data'),
      ];
    }

    return [
      new SocialConfigDTO(
        id as string,
        whatsappNumber as string,
        whatsappAccessToken as string,
        whatsappBusinessPhoneId as string,
        whatsappDisplayPhone as string,
        facebookEndpoint as string,
        whatsappApiVersion as string,
        facebookPageUrl as string,
        instagramPageUrl as string,
        whatsappListDescription as string,
        whatsappButtonOptionsTitle as string,
        createdAt as Date,
        updatedAt as Date
      ),
      undefined,
    ];
  }

  public toDomain(): SocialConfig {
    return {
      id: this.id,
      whatsappNumber: this.whatsappNumber,
      whatsappAccessToken: this.whatsappAccessToken,
      whatsappBusinessPhoneId: this.whatsappBusinessPhoneId,
      whatsappDisplayPhone: this.whatsappDisplayPhone,
      facebookEndpoint: this.facebookEndpoint,
      whatsappApiVersion: this.whatsappApiVersion,
      facebookPageUrl: this.facebookPageUrl,
      instagramPageUrl: this.instagramPageUrl,
      whatsappListDescription: this.whatsappListDescription,
      whatsappButtonOptionsTitle: this.whatsappButtonOptionsTitle,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
