import { assistant } from './assistant/es';
import { common } from './common/es';
import { configuration } from './configuration/es';
import { dashboard } from './dashboard/es';
import { errors } from './errors/es';
import { navigation } from './navigation/es';
import { paymentRequired } from './paymentRequired/es';
import { profile } from './profile/es';
import { success } from './success/es';
import { training } from './training/es';

export const es = {
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
