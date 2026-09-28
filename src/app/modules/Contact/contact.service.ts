import httpStatus from "http-status";
import { ContactMessage, ContactMessageStatus, ContactMessageType } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import { paginationHelpers } from "../../../utils/paginationHelper";
import { buildPrismaWhere } from "../../../utils/queryBuilder";
import { enumToUi, formatDate } from "../../../utils/formatters";

const contactSearchableFields = ["sender", "email", "fullMessage"];

// Helper to format a contact message for the frontend
const formatMessageItem = (m: any) => ({
  id: m.id,
  sender: m.sender,
  email: m.email,
  type: enumToUi(m.type) as "Bug" | "Suggestion" | "Idea",
  messagePreview: m.messagePreview,
  fullMessage: m.fullMessage,
  hasAttachment: m.hasAttachment,
  attachmentUrl: m.attachmentUrl,
  date: formatDate(m.createdAt),
  status: enumToUi(m.status) as "Unread" | "Read" | "Resolved",
});

const createMessage = async (payload: Partial<ContactMessage>) => {
  if (!payload.sender || !payload.email || !payload.fullMessage) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Sender, email, and message are required");
  }

  const messagePreview =
    payload.fullMessage.slice(0, 80) + (payload.fullMessage.length > 80 ? "..." : "");

  const result = await prisma.contactMessage.create({
    data: {
      sender: payload.sender,
      email: payload.email,
      type: payload.type || ContactMessageType.SUGGESTION,
      messagePreview,
      fullMessage: payload.fullMessage,
      hasAttachment: payload.hasAttachment || Boolean(payload.attachmentUrl),
      attachmentUrl: payload.attachmentUrl,
      status: ContactMessageStatus.UNREAD,
    },
  });

  return formatMessageItem(result);
};

const getAllMessages = async (
  filters: { status?: ContactMessageStatus; type?: ContactMessageType; searchTerm?: string },
  options: IPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, status, type } = filters;

  const normalizedFilters: Record<string, any> = {
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
  };

  const whereConditions = buildPrismaWhere(
    searchTerm,
    contactSearchableFields,
    normalizedFilters
  );

  const [result, total, unreadCount] = await Promise.all([
    prisma.contactMessage.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.contactMessage.count({ where: whereConditions }),
    prisma.contactMessage.count({ where: { status: ContactMessageStatus.UNREAD } }),
  ]);

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit), unreadCount },
    data: result.map(formatMessageItem),
  };
};

const getMessageById = async (id: string) => {
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, "Message not found!");
  }

  // Automatically mark as read if it was unread
  if (message.status === ContactMessageStatus.UNREAD) {
    await prisma.contactMessage.update({
      where: { id },
      data: { status: ContactMessageStatus.READ },
    });
    message.status = ContactMessageStatus.READ;
  }

  return formatMessageItem(message);
};

const updateMessageStatus = async (id: string, status: ContactMessageStatus) => {
  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Message not found!");
  }

  const updated = await prisma.contactMessage.update({
    where: { id },
    data: { status },
  });

  return formatMessageItem(updated);
};

export const ContactService = {
  createMessage,
  getAllMessages,
  getMessageById,
  updateMessageStatus,
};
