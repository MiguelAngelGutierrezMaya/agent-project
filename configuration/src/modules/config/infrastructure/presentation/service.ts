import { Service } from '@modules/infrastructure/presentation/service';
import { Application } from '@src/infrastructure/presentation/application';
import { HTTP_STATUS_CODES } from '@src/infrastructure/shared/utils/constants';
import { GetConfigDto } from '@modules/config/domain/dto/GetConfigDTO';
import { UpdateConfigDTO } from '@modules/config/domain/dto/UpdateConfigDTO';
import {
  GetConfigUseCase,
  UpdateConfigUseCase,
} from '@modules/config/application/use-cases/ConfigUseCase';
import { SendConfigNotificationUseCase } from '@modules/config/application/use-cases/SendConfigNotificationUseCase';
import {
  ConfigNotificationEventType,
  type ConfigNotification,
} from '@modules/config/domain/models/ConfigNotification';
import { PgConfigDatasourceImp } from '@modules/config/infrastructure/datasource/PgConfigDatasourceImp';
import { ConfigRepositoryImp } from '@modules/config/infrastructure/repositories/ConfigRepositoryImp';
import { SqsNotificationDatasourceImp } from '@modules/config/infrastructure/datasource/SqsNotificationDatasourceImp';
import { NotificationRepositoryImp } from '@modules/config/infrastructure/repositories/NotificationRepositoryImp';

/**
 * Service for handling configuration-related HTTP requests
 * Manages configuration retrieval and update operations
 */
export class ConfigService extends Service {
  /**
   * The configuration repository instance
   */
  private configRepository: ConfigRepositoryImp;

  /**
   * The notification repository instance
   */
  private notificationRepository: NotificationRepositoryImp;

  /**
   * Creates a new ConfigService instance
   * @param app - The application instance
   */
  constructor(public readonly app: Application) {
    super(app);

    /* Configuration repository setup */
    const configDatasource = new PgConfigDatasourceImp(this.app.logger);
    this.configRepository = new ConfigRepositoryImp(configDatasource);

    /* Notification repository setup */
    const notificationDatasource = new SqsNotificationDatasourceImp(
      this.app.logger
    );
    this.notificationRepository = new NotificationRepositoryImp(
      notificationDatasource
    );
  }

  /**
   * Handles GET requests for configuration retrieval
   * Retrieves configuration for a specific user with schema information
   * @returns Promise that resolves to the HTTP response with configuration data
   */
  override async executeGET(): Promise<Response> {
    this.app.logger.info('Executing config GET request', ConfigService.name);

    const [configDTO, error] = GetConfigDto.create(
      this.app.event.queryStringParameters?.userId || ''
    );

    if (error) {
      throw error;
    }

    const getConfigUseCase = new GetConfigUseCase(this.configRepository);

    const config = await getConfigUseCase.execute(configDTO?.userId || '');

    return new Response(JSON.stringify({ success: true, data: config }), {
      status: HTTP_STATUS_CODES.SUCCESS,
    });
  }

  /**
   * Handles PUT requests for configuration updates
   * Updates configuration for a specific user and sends a notification
   * @returns Promise that resolves to the HTTP response with updated configuration
   */
  override async executePUT(): Promise<Response> {
    this.app.logger.info('Executing config PUT request', ConfigService.name);

    const [updateDTO, error] = UpdateConfigDTO.create(
      this.app.event.body ? JSON.parse(this.app.event.body) : {}
    );

    if (error) {
      throw error;
    }

    const updateConfigUseCase = new UpdateConfigUseCase(this.configRepository);

    const updatedConfigWithSchema = await updateConfigUseCase.execute(
      updateDTO?.userId || '',
      updateDTO!.toDomain()
    );

    /* Send notification about the configuration update with schema information */
    const sendNotificationUseCase = new SendConfigNotificationUseCase(
      this.notificationRepository
    );

    const notification: ConfigNotification = {
      eventType: ConfigNotificationEventType.CONFIG_UPDATED,
      userId: updateDTO?.userId || '',
      config: updatedConfigWithSchema, // Include schema for notification
      timestamp: new Date(),
      metadata: {
        source: 'config-service',
        action: 'update',
      },
    };

    await sendNotificationUseCase.execute(notification);

    this.app.logger.info(
      `Configuration update notification sent - User: ${updateDTO?.userId}, Config: ${updatedConfigWithSchema.id}, Schema: ${updatedConfigWithSchema.schema}`,
      ConfigService.name
    );

    /* Destructure to exclude schema from HTTP response */
    const { schema, ...configWithoutSchema } = updatedConfigWithSchema;

    return new Response(
      JSON.stringify({ success: true, data: configWithoutSchema }),
      {
        status: HTTP_STATUS_CODES.SUCCESS,
      }
    );
  }
}
