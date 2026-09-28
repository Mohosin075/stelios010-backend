import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import ApiError from "../../errors/ApiErrors";
import prisma from "../../shared/prisma";
import { jwtHelpers } from "../../utils/jwtHelpers";
import { UserRole, UserStatus } from "@prisma/client";

const auth = (...roles: UserRole[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      let token = req.headers.authorization;

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      // Handle "Bearer <token>" format
      if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length).trim();
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.jwt_secret as Secret
      );

      const user = await prisma.user.findUnique({
        where: {
          id: verifiedUser.id || verifiedUser.userId,
        },
      });

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User does not exist!");
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new ApiError(httpStatus.FORBIDDEN, `Your account is ${user.status.toLowerCase()}!`);
      }

      if (roles.length && !roles.includes(verifiedUser.role as UserRole)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden! You do not have permission to perform this action.");
      }

      req.user = verifiedUser;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
