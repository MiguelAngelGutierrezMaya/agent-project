import { StackModel } from './StackModel';

export interface LambdaModel extends StackModel {
  makeIntegration(): void;

  addPolicies(): void;

  addPermissions(): void;
}
