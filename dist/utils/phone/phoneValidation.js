"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMobilenumber = void 0;
const validateMobilenumber = (phone) => {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone);
};
exports.validateMobilenumber = validateMobilenumber;
