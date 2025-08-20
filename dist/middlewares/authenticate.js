"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const customErrors_1 = require("../constants/constants/customErrors");
const tokenUtils_1 = require("../utils/token/tokenUtils");
const authenticate = (roles = ['user']) => {
    return (req, res, next) => {
        var _a;
        const accessToken = req.cookies['ecom-access-token'];
        if (!accessToken)
            throw new customErrors_1.UnAuthorizedError("Unauthorized: No access token provided");
        const decoded = (0, tokenUtils_1.verifyToken)(accessToken);
        if (!(decoded === null || decoded === void 0 ? void 0 : decoded.data))
            throw new customErrors_1.UnAuthorizedError("Unauthorized: Invalid or expired access token");
        req.user = { _id: (_a = decoded === null || decoded === void 0 ? void 0 : decoded.data) === null || _a === void 0 ? void 0 : _a.userId, role: decoded.data.role };
        if (roles.length && !roles.includes(req.user.role)) {
            throw new customErrors_1.UnAuthorizedError("Forbidden: You don’t have access to this resource");
        }
        next();
    };
};
exports.authenticate = authenticate;
