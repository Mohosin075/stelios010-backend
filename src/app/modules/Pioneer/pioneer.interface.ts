import { ClaimedStatus, SubscriptionStatus, VerificationStatus } from "@prisma/client";

export type IPioneerFilterRequest = {
  searchTerm?: string;
  claimedStatus?: ClaimedStatus;
  subscriptionStatus?: SubscriptionStatus;
  verificationStatus?: VerificationStatus;
};

export type IUpdatePioneerSettings = {
  claimedStatus?: ClaimedStatus;
  subscriptionStatus?: SubscriptionStatus;
  verificationStatus?: VerificationStatus;
};
