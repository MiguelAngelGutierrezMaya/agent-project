export interface ProfileData {
  companyName: string;
  email: string;
  adminName: string;
  phone: string;
  address: string;
}

export interface PasswordData {
  current: string;
  new: string;
  confirm: string;
}

export interface AccountStat {
  label: string;
  value: string;
  color: string;
  bgColor: string;
}
