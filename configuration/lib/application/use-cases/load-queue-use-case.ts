import { QueueModel } from '@lib/domain/models/QueueModel';

/**
 * Load queue use case
 *
 * @description Use case responsible for initializing the SQS queue stack.
 * This use case orchestrates the creation of the queue infrastructure.
 *
 * @class LoadQueueUseCase
 */
export class LoadQueueUseCase {
  private queueStack: QueueModel;

  /**
   * Creates an instance of LoadQueueUseCase.
   *
   * @param {QueueModel} queueStack - The queue stack to initialize
   */
  constructor(queueStack: QueueModel) {
    this.queueStack = queueStack;
  }

  /**
   * Executes the use case
   *
   * @description Initializes the queue stack by calling its init method.
   *
   * @returns {void}
   */
  execute(): void {
    this.queueStack.init();
  }
}
