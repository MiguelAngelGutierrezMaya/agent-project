import { PrintDataModel } from '@lib/domain/models/PrintDataModel';

export class PrintUseCase {
  private printer: PrintDataModel;

  constructor(printer: PrintDataModel) {
    this.printer = printer;
  }

  public execute(): void {
    this.printer.print();
  }
}
