import { AccountStatus, ProfileType, UserRole, UserStatus, VerificationStatus } from "@prisma/client";

export type IUserFilterRequest = {
  searchTerm?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  profileType?: ProfileType;
  accountStatus?: AccountStatus;
  verificationStatus?: VerificationStatus;
};

export type ISuspendUserPayload = {
  reason: string;
};
