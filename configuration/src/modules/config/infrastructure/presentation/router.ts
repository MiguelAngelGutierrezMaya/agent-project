import { ConfigController } from './controller';
import type { ModuleType } from '@modules/infrastructure/presentation/module';
import type { Application } from '@infrastructure/presentation/application';

export const ROUTES: Array<ModuleType> = [
  {
    url: '/config',
    controller: (app: Application) => new ConfigController(app),
  },
];
