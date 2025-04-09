export interface Account {
  userID: number;
  avatar: string | null;
  fullname: string | null;
  username: string;
  email: string;
  status: number;
}

export interface AccountDetail {
  userID: number;
  username: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  avatar: string | null;
  dateOfBirth: Date | null;
  gender: number | null;
  address: string | null;
  status: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  googleID: string | null;
  facebookID: string | null;
  otp: string | null;
  roleID: number | null;
  lockTime: Date | null;
  remainTime: number | null;
}
