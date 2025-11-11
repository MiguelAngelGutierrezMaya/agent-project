import { ProductsController, ProductsCategoriesController } from './controller';
import type { ModuleType } from '@modules/infrastructure/presentation/module';
import type { Application } from '@infrastructure/presentation/application';

export const ROUTES: Array<ModuleType> = [
  {
    url: '/products',
    controller: (app: Application) => new ProductsController(app),
  },
  {
    url: '/products/categories',
    controller: (app: Application) => new ProductsCategoriesController(app),
  },
];
