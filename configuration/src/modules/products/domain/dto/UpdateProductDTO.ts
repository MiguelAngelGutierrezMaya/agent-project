import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import { UpdateProductDetailDTO } from '@modules/products/domain/dto/UpdateProductDetailDTO';

export class UpdateProductDTO {
  constructor(
    public readonly userId: string,
    public readonly id: string,
    public readonly categoryId?: string,
    public readonly name?: string,
    public readonly type?: 'product' | 'service',
    public readonly description?: string,
    public readonly imageUrl?: string,
    public readonly isEmbedded?: boolean,
    public readonly isFeatured?: boolean,
    public readonly details?: UpdateProductDetailDTO
  ) {}

  static create(
    data: Record<
      string,
      | string
      | boolean
      | UpdateProductDetailDTO
      | Record<string, string | number>
    >
  ): [UpdateProductDTO?, DomainValidationError?] {
    const {
      userId,
      id,
      categoryId,
      name,
      type,
      description,
      imageUrl,
      isEmbedded,
      isFeatured,
      details,
    } = data;

    if (!userId || !id) {
      return [
        undefined,
        new DomainValidationError('User ID and Product ID are required'),
      ];
    }

    if (type && type !== 'product' && type !== 'service') {
      return [
        undefined,
        new DomainValidationError('Type must be product or service'),
      ];
    }

    // Validate details if provided
    let validatedDetails: UpdateProductDetailDTO | undefined;
    if (details) {
      if (details instanceof UpdateProductDetailDTO) {
        validatedDetails = details;
      } else {
        const [detailDTO, detailError] = UpdateProductDetailDTO.create(
          details as Record<string, string | number>
        );
        if (detailError) {
          return [undefined, detailError];
        }
        validatedDetails = detailDTO!;
      }
    }

    return [
      new UpdateProductDTO(
        userId as string,
        id as string,
        categoryId as string,
        name as string,
        type as 'product' | 'service',
        description as string,
        imageUrl as string,
        isEmbedded as boolean,
        isFeatured as boolean,
        validatedDetails
      ),
      undefined,
    ];
  }
}
