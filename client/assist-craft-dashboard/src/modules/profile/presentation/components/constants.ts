import type { ProfileData, PasswordData, AccountStat } from './types';

export const initialProfileData: ProfileData = {
  companyName: 'Acme Corporation',
  email: 'admin@acme.com',
  adminName: 'John Smith',
  phone: '+1 (555) 123-4567',
  address: '123 Business Ave, Suite 100, San Francisco, CA 94105',
};

export const initialPasswordData: PasswordData = {
  current: '',
  new: '',
  confirm: '',
};

export const accountStats: AccountStat[] = [
  {
    label: 'Training Documents',
    value: '24',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    label: 'Chat Sessions',
    value: '1.2K',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    label: 'Embeddings',
    value: '89.2K',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    label: 'Days Active',
    value: '30',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];
