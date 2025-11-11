import { LambdaModel } from '@lib/domain/models/LambdaModel';

export class LoadLambdaUseCase {
  private lambdaModel: LambdaModel;

  constructor(lambdaModel: LambdaModel) {
    this.lambdaModel = lambdaModel;
  }

  execute(): void {
    this.lambdaModel.init();
    this.lambdaModel.addPolicies();
    this.lambdaModel.addPermissions();
    this.lambdaModel.makeIntegration();
  }
}
