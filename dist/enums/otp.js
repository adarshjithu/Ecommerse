"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTP_Method = exports.OTP_Pupose = void 0;
var OTP_Pupose;
(function (OTP_Pupose) {
    OTP_Pupose["LOGIN_EMAIL"] = "login-email";
    OTP_Pupose["LOGIN_PHONE"] = "login-phone";
    OTP_Pupose["RESET_PASSWORD"] = "reset-password";
    OTP_Pupose["VERIFY_EMAIL"] = "verify-email";
    OTP_Pupose["EVERIRY_PHONE"] = "verify-phone";
})(OTP_Pupose || (exports.OTP_Pupose = OTP_Pupose = {}));
var OTP_Method;
(function (OTP_Method) {
    OTP_Method["EMAIL"] = "email";
    OTP_Method["PHONE"] = "phone";
})(OTP_Method || (exports.OTP_Method = OTP_Method = {}));
