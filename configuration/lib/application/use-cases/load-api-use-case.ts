import { ApiModel } from '@lib/domain/models/ApiModel';

export class LoadApiUseCase {
  private apiModel: ApiModel;

  constructor(apiModel: ApiModel) {
    this.apiModel = apiModel;
  }

  execute(): void {
    this.apiModel.init();
  }
}
