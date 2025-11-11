import { Service } from '@modules/infrastructure/presentation/service';
import { Application } from '@src/infrastructure/presentation/application';
import { HTTP_STATUS_CODES } from '@src/infrastructure/shared/utils/constants';
import { CreateFileUseCase } from '@modules/files/application/use-cases/CreateFileUseCase';
import { GetFileUseCase } from '@modules/files/application/use-cases/GetFileUseCase';
import { FileRepositoryImp } from '@modules/files/infrastructure/repositories/FileRepositoryImp';
import { S3FileDatasourceImp } from '@modules/files/infrastructure/datasource/S3FileDatasourceImp';
import { CreateFileDTO } from '@modules/files/domain/dto/CreateFileDTO';
import { GetFileDTO } from '@modules/files/domain/dto/GetFileDTO';

/**
 * Service for handling file-related HTTP requests
 * Manages file upload and retrieval operations
 */
export class FilesService extends Service {
  private createFileUseCase: CreateFileUseCase;
  private getFileUseCase: GetFileUseCase;

  /**
   * Creates a new FilesService instance
   * @param app - The application instance
   */
  constructor(public readonly app: Application) {
    super(app);

    // Initialize datasource and repository
    const fileDatasource = new S3FileDatasourceImp(app.logger);
    const fileRepository = new FileRepositoryImp(fileDatasource);

    // Initialize use cases
    this.createFileUseCase = new CreateFileUseCase(fileRepository);
    this.getFileUseCase = new GetFileUseCase(fileRepository);
  }

  /**
   * Handles GET requests for file retrieval
   * Generates presigned URLs for file access
   * @returns Promise that resolves to the HTTP response with presigned URL
   */
  override async executeGET(): Promise<Response> {
    this.app.logger.info('Executing files GET request', FilesService.name);

    // Get key from query parameters
    const key = this.app.event.queryStringParameters?.key || '';

    // Create get file DTO
    const [getFileDTO, error] = GetFileDTO.create({
      key: key,
    });

    if (error) {
      throw error;
    }

    // Execute use case
    const presignedUrl = await this.getFileUseCase.execute(getFileDTO!.key);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          presignedUrl,
        },
      }),
      {
        status: HTTP_STATUS_CODES.SUCCESS,
      }
    );
  }

  /**
   * Handles POST requests for file upload
   * Processes base64 encoded files and uploads them to S3
   * @returns Promise that resolves to the HTTP response with S3 key
   */
  override async executePOST(): Promise<Response> {
    this.app.logger.info('Executing files POST request', FilesService.name);

    // Parse JSON body
    const body = JSON.parse(this.app.event.body || '{}');

    // Create upload DTO
    const [createFileDTO, error] = CreateFileDTO.create({
      file: body.file,
      fileName: body.fileName,
      fileType: body.fileType,
      pathPrefix: body.pathPrefix,
    });

    if (error) {
      throw error;
    }

    const { file, fileName, fileType, pathPrefix } = createFileDTO!.toDomain();

    // Execute use case
    const key = await this.createFileUseCase.execute(
      file,
      fileName,
      fileType,
      pathPrefix
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: { key },
      }),
      {
        status: HTTP_STATUS_CODES.SUCCESS,
      }
    );
  }
}
