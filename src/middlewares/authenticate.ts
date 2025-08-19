import { NextFunction, Request, Response } from "express";
import { NotFoundError, UnAuthorizedError } from "../constants/constants/customErrors";
import { verifyToken } from "../utils/token/tokenUtils";
export const authenticate = (roles: string[] = ['user']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies['ecom-access-token'];
    if (!accessToken) throw new UnAuthorizedError("Unauthorized: No access token provided");

    const decoded: any = verifyToken(accessToken);
    if (!decoded?.data) throw new UnAuthorizedError("Unauthorized: Invalid or expired access token");

    req.user = {_id:decoded?.data?.userId,role:decoded.data.role}

    if (roles.length && !roles.includes(req.user.role)) {
      throw new UnAuthorizedError("Forbidden: You don’t have access to this resource");
    }

    next();
  };
};
