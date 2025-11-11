export type VerifyMode = 'subscribe' | 'unsubscribe';

export interface Verify {
  mode: VerifyMode;
  challenge: string;
  token: string;
}
