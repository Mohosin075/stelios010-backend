import { PollStatus } from "@prisma/client";

export type IPollFilterRequest = {
  status?: PollStatus;
  searchTerm?: string;
};

export type ICreatePollPayload = {
  question: string;
  audience?: string;
  endDate: string;
  options: string[];
};
