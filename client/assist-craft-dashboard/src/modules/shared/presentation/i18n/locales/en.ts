import { assistant } from './assistant/en';
import { common } from './common/en';
import { configuration } from './configuration/en';
import { dashboard } from './dashboard/en';
import { errors } from './errors/en';
import { navigation } from './navigation/en';
import { paymentRequired } from './paymentRequired/en';
import { profile } from './profile/en';
import { success } from './success/en';
import { training } from './training/en';

export const en = {
  common,
  navigation,
  dashboard,
  profile,
  training,
  assistant,
  configuration,
  errors,
  success,
  paymentRequired,
} as const;

export type TranslationKeys = typeof en;
