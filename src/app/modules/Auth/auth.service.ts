import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { jwtHelpers } from "../../../utils/jwtHelpers";
import emailSender from "../../../helpars/emailSender/emailSender";
import {
  IChangePassword,
  IForgotPassword,
  ILoginResponse,
  ILoginUser,
  IResetPassword,
  IUpdateProfile,
  IVerifyOtp,
} from "./auth.interface";
import { UserStatus } from "@prisma/client";

const loginUser = async (payload: ILoginUser): Promise<ILoginResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found with this email!");
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new ApiError(httpStatus.FORBIDDEN, `Your account is ${user.status.toLowerCase()}!`);
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password does not match!");
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    },
  };
};

const refreshToken = async (token: string) => {
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token_secret as Secret
    );
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, "Invalid refresh token!");
  }

  const { id } = verifiedToken;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not exist!");
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new ApiError(httpStatus.FORBIDDEN, `Your account is ${user.status.toLowerCase()}!`);
  }

  const newAccessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken: newAccessToken,
  };
};

const changePassword = async (userId: string, payload: IChangePassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const isPasswordMatched = await bcrypt.compare(payload.oldPassword, user.password);
  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Current password is incorrect!");
  }

  const hashedNewPassword = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedNewPassword,
    },
  });

  return {
    message: "Password changed successfully!",
  };
};

const forgotPassword = async (payload: IForgotPassword) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "No account found with this email!");
  }

  // Generate 6 digit numeric OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.otp.create({
    data: {
      email: payload.email,
      otp: otpCode,
      expiresAt,
    },
  });

  console.log(`🔐 Password Reset OTP for ${payload.email}: ${otpCode}`);

  try {
    if (config.emailSender.email && config.emailSender.app_pass) {
      await emailSender(
        "Password Reset Verification Code",
        payload.email,
        `<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Your 6-digit verification code is:</p>
          <h1 style="color: #FFC800; letter-spacing: 5px;">${otpCode}</h1>
          <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>`
      );
    }
  } catch (error) {
    console.warn("Email sender failed to deliver, but OTP is generated in DB:", error);
  }

  return {
    message: "Verification code sent to your email successfully!",
  };
};

const verifyOtp = async (payload: IVerifyOtp) => {
  const validOtp = await prisma.otp.findFirst({
    where: {
      email: payload.email,
      otp: payload.otp,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!validOtp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid or expired verification code!");
  }

  return {
    message: "OTP verified successfully!",
  };
};

const resetPassword = async (payload: IResetPassword) => {
  const validOtp = await prisma.otp.findFirst({
    where: {
      email: payload.email,
      otp: payload.otp,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!validOtp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid or expired verification code!");
  }

  const hashedPassword = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
    where: { email: payload.email },
    data: {
      password: hashedPassword,
    },
  });

  // Clean up used OTPs
  await prisma.otp.deleteMany({
    where: { email: payload.email },
  });

  return {
    message: "Password reset successfully! You can now login with your new password.",
  };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      avatar: true,
      profileType: true,
      location: true,
      country: true,
      region: true,
      city: true,
      bio: true,
      verificationStatus: true,
      accountStatus: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  return user;
};

const updateProfile = async (userId: string, payload: IUpdateProfile) => {
  if (payload.email) {
    const existing = await prisma.user.findFirst({
      where: {
        email: payload.email,
        NOT: { id: userId },
      },
    });
    if (existing) {
      throw new ApiError(httpStatus.CONFLICT, "Email is already taken by another account!");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      avatar: true,
      profileType: true,
      location: true,
      country: true,
      region: true,
      city: true,
      bio: true,
      verificationStatus: true,
      accountStatus: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const AuthService = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getMe,
  updateProfile,
};
