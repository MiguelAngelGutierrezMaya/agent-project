import { BucketStack } from '@lib/domain/models/BucketStack';

export class LoadBucketUserCase {
  private bucketStack: BucketStack;

  constructor(bucketStack: BucketStack) {
    this.bucketStack = bucketStack;
  }

  execute(): void {
    this.bucketStack.init();
  }
}
