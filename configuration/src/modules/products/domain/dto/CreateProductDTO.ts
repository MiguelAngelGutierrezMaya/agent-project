import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import { ProductDetailDTO } from '@modules/products/domain/dto/ProductDetailDTO';

export class CreateProductDTO {
  constructor(
    public readonly userId: string,
    public readonly categoryId: string,
    public readonly name: string,
    public readonly type: 'product' | 'service',
    public readonly details: ProductDetailDTO,
    public readonly description?: string,
    public readonly imageUrl?: string,
    public readonly isEmbedded: boolean = false,
    public readonly isFeatured: boolean = false
  ) {}

  static create(
    data: Record<string, string | boolean | ProductDetailDTO>
  ): [CreateProductDTO?, DomainValidationError?] {
    const {
      userId,
      categoryId,
      name,
      type,
      description,
      imageUrl,
      isEmbedded = false,
      isFeatured = false,
      details,
    } = data;

    if (!userId || !categoryId || !name || !type || !details) {
      return [
        undefined,
        new DomainValidationError(
          'Missing required fields: userId, categoryId, name, type, details'
        ),
      ];
    }

    if (type !== 'product' && type !== 'service') {
      return [
        undefined,
        new DomainValidationError('Type must be product or service'),
      ];
    }

    return [
      new CreateProductDTO(
        userId as string,
        categoryId as string,
        name as string,
        type as 'product' | 'service',
        details as ProductDetailDTO,
        description as string,
        imageUrl as string,
        isEmbedded as boolean,
        isFeatured as boolean
      ),
      undefined,
    ];
  }
}
