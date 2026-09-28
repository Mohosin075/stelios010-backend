import { CommunityMeetStatus, SupportGroupStatus } from "@prisma/client";

export type ISupportGroupFilter = {
  searchTerm?: string;
  status?: SupportGroupStatus;
};

export type ICommunityMeetFilter = {
  searchTerm?: string;
  status?: CommunityMeetStatus;
};
