export type IVerificationFilterRequest = {
  searchTerm?: string;
  status?: string; // UI sends "Approved" | "Pending" | "Unsuccessful" — normalized to DB enum in service
  limb?: string;   // UI sends "Upper Limb" | "Lower Limb" — normalized to DB enum in service
  userId?: string;
};

export type IRejectVerificationPayload = {
  reason: string;
};
