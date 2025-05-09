export interface Account {
  userID: number;
  avatar: string | null;
  fullName: string | null;
  username: string;
  email: string;
  statusName: string;
  roles: string;
}

export interface AccountDetail {
  userID: number;
  username: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  avatar: string | null;
  dateOfBirth: string | null;
  gender: number | null;
  address: string | null;
  status: number;
  createdAt: string | null;
  updatedAt: string | null;
  googleID: string | null;
  facebookID: string | null;
  otp: string | null;
  roleID: number | null;
  lockTime: string | null;
  remainTime: number | null;
}
