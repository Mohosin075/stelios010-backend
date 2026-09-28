export type ILoginUser = {
  email: string;
  password: string;
};

export type ILoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    avatar?: string | null;
  };
};

export type IChangePassword = {
  oldPassword: string;
  newPassword: string;
};

export type IForgotPassword = {
  email: string;
};

export type IVerifyOtp = {
  email: string;
  otp: string;
};

export type IResetPassword = {
  email: string;
  otp: string;
  newPassword: string;
};

export type IUpdateProfile = {
  name?: string;
  email?: string;
  avatar?: string;
};
