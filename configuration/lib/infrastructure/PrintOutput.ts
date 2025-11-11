import { PrintDataModel } from '@lib/domain/models/PrintDataModel';
import { CfnOutput, CfnOutputProps, Stack } from 'aws-cdk-lib';

export class PrintOutput implements PrintDataModel {
  private readonly dataToPrint?: CfnOutputProps;
  private readonly stack: Stack;
  private readonly id: string;

  constructor(stack: Stack, id: string, dataToPrint?: CfnOutputProps) {
    this.stack = stack;
    this.id = id;
    this.dataToPrint = dataToPrint;
  }

  print(): void {
    new CfnOutput(
      this.stack,
      this.id,
      this.dataToPrint || {
        value: `${this.id}: No data to print`,
      }
    );
  }
}
