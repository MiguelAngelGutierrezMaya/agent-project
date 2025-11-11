import { EmbeddingController, EmbeddingStatusController } from './controller';
import type { ModuleType } from '@modules/infrastructure/presentation/module';
import type { Application } from '@infrastructure/presentation/application';

export const ROUTES: Array<ModuleType> = [
  {
    url: '/embedding/generate',
    controller: (app: Application) => new EmbeddingController(app),
  },
  {
    url: '/embedding/status',
    controller: (app: Application) => new EmbeddingStatusController(app),
  },
];
