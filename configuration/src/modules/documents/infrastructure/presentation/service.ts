import { Service } from '@modules/infrastructure/presentation/service';
import { Application } from '@src/infrastructure/presentation/application';
import { HTTP_STATUS_CODES } from '@src/infrastructure/shared/utils/constants';
import { GetDocumentsDTO } from '@modules/documents/domain/dto/GetDocumentsDTO';
import { CreateDocumentDTO } from '@modules/documents/domain/dto/CreateDocumentDTO';
import { UpdateDocumentDTO } from '@modules/documents/domain/dto/UpdateDocumentDTO';
import { DeleteDocumentDTO } from '@modules/documents/domain/dto/DeleteDocumentDTO';
import {
  GetDocumentsUseCase,
  CreateDocumentUseCase,
  UpdateDocumentUseCase,
  DeleteDocumentUseCase,
} from '@modules/documents/application/use-cases/DocumentUseCase';
import { PgDocumentDatasourceImp } from '@modules/documents/infrastructure/datasource/PgDocumentDatasourceImp';
import { DocumentRepositoryImp } from '@modules/documents/infrastructure/repositories/DocumentRepositoryImp';

export class DocumentsService extends Service {
  private documentRepository: DocumentRepositoryImp;

  /**
   * Constructor for the DocumentsService
   * @param {Application} app - The application instance
   */
  constructor(public readonly app: Application) {
    super(app);
    const documentDatasource = new PgDocumentDatasourceImp(this.app.logger);
    this.documentRepository = new DocumentRepositoryImp(documentDatasource);
  }

  /**
   * Execute GET request for documents
   * @returns {Promise<Response>} The response from the documents service
   */
  override async executeGET(): Promise<Response> {
    this.app.logger.info(
      'Executing documents GET request',
      DocumentsService.name
    );

    const [getDocumentsDTO, error] = GetDocumentsDTO.create({
      userId: this.app.event.queryStringParameters?.userId || '',
      limit: this.app.event.queryStringParameters?.limit
        ? Number(this.app.event.queryStringParameters.limit)
        : undefined,
      offset: this.app.event.queryStringParameters?.offset
        ? Number(this.app.event.queryStringParameters.offset)
        : undefined,
    });

    if (error) {
      throw error;
    }

    const getDocumentsUseCase = new GetDocumentsUseCase(
      this.documentRepository
    );
    const documentsResponse = await getDocumentsUseCase.execute(
      getDocumentsDTO?.userId || '',
      getDocumentsDTO?.limit,
      getDocumentsDTO?.offset
    );

    return new Response(
      JSON.stringify({ success: true, data: documentsResponse }),
      {
        status: HTTP_STATUS_CODES.SUCCESS,
      }
    );
  }

  /**
   * Execute POST request for creating a document
   * @returns {Promise<Response>} The response from the documents service
   */
  override async executePOST(): Promise<Response> {
    this.app.logger.info(
      'Executing documents POST request',
      DocumentsService.name
    );

    const [createDocumentDTO, error] = CreateDocumentDTO.create(
      this.app.event.body ? JSON.parse(this.app.event.body) : {}
    );

    if (error) {
      throw error;
    }

    const createDocumentUseCase = new CreateDocumentUseCase(
      this.documentRepository
    );
    const document = await createDocumentUseCase.execute(
      createDocumentDTO?.userId || '',
      createDocumentDTO!.toDomain()
    );

    return new Response(JSON.stringify({ success: true, data: document }), {
      status: HTTP_STATUS_CODES.SUCCESS,
    });
  }

  /**
   * Execute PUT request for updating a document
   * @returns {Promise<Response>} The response from the documents service
   */
  override async executePUT(): Promise<Response> {
    this.app.logger.info(
      'Executing documents PUT request',
      DocumentsService.name
    );

    const [updateDocumentDTO, error] = UpdateDocumentDTO.create(
      this.app.event.body ? JSON.parse(this.app.event.body) : {}
    );

    if (error) {
      throw error;
    }

    const updateDocumentUseCase = new UpdateDocumentUseCase(
      this.documentRepository
    );
    const document = await updateDocumentUseCase.execute(
      updateDocumentDTO?.userId || '',
      updateDocumentDTO!.toDomain()
    );

    return new Response(JSON.stringify({ success: true, data: document }), {
      status: HTTP_STATUS_CODES.SUCCESS,
    });
  }

  /**
   * Execute DELETE request for deleting a document
   * @returns {Promise<Response>} The response from the documents service
   */
  override async executeDELETE(): Promise<Response> {
    this.app.logger.info(
      'Executing documents DELETE request',
      DocumentsService.name
    );

    const [deleteDocumentDTO, error] = DeleteDocumentDTO.create(
      this.app.event.body ? JSON.parse(this.app.event.body) : {}
    );

    if (error) {
      throw error;
    }

    const deleteDocumentUseCase = new DeleteDocumentUseCase(
      this.documentRepository
    );
    await deleteDocumentUseCase.execute(
      deleteDocumentDTO?.userId || '',
      deleteDocumentDTO!.id
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Document deleted successfully',
      }),
      {
        status: HTTP_STATUS_CODES.SUCCESS,
      }
    );
  }
}
