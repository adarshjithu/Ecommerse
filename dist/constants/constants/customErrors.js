"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyRequestBodyError = exports.UnsupportedMediaTypeError = exports.PayloadTooLargeError = exports.GatewayTimeoutError = exports.NotImplementedError = exports.ConflictError = exports.ServiceUnavailableError = exports.InternalServerError = exports.MethodNotAllowedError = exports.NotFoundError = exports.ForbiddenError = exports.UnAuthorizedError = exports.BadRequestError = void 0;
// Bad Request Error (400)
class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.status = 400;
        this.name = "BadRequestError";
    }
}
exports.BadRequestError = BadRequestError;
// errors 
// Unauthorized Error (401 )
class UnAuthorizedError extends Error {
    constructor(message) {
        super(message);
        this.status = 401;
        this.name = "UnAuthorizedError";
    }
}
exports.UnAuthorizedError = UnAuthorizedError;
// Forbidden Error (403)
class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.status = 403;
        this.name = "ForbiddenError";
    }
}
exports.ForbiddenError = ForbiddenError;
// Not Found Error (404)
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.status = 404;
        this.name = "NotFoundError";
    }
}
exports.NotFoundError = NotFoundError;
// Method Not Allowed Error (405)
class MethodNotAllowedError extends Error {
    constructor(message) {
        super(message);
        this.status = 405;
        this.name = "MethodNotAllowedError";
    }
}
exports.MethodNotAllowedError = MethodNotAllowedError;
// Internal Server Error (500)
class InternalServerError extends Error {
    constructor(message) {
        super(message);
        this.status = 500;
        this.name = "InternalServerError";
    }
}
exports.InternalServerError = InternalServerError;
// Service Unavailable Error (503)
class ServiceUnavailableError extends Error {
    constructor(message) {
        super(message);
        this.status = 503;
        this.name = "ServiceUnavailableError";
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
// Conflict Error (409)
class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.status = 409;
        this.name = "ConflictError";
    }
}
exports.ConflictError = ConflictError;
// Not Implemented Error (501)
class NotImplementedError extends Error {
    constructor(message) {
        super(message);
        this.status = 501;
        this.name = "NotImplementedError";
    }
}
exports.NotImplementedError = NotImplementedError;
// Gateway Timeout Error (504)
class GatewayTimeoutError extends Error {
    constructor(message) {
        super(message);
        this.status = 504;
        this.name = "GatewayTimeoutError";
    }
}
exports.GatewayTimeoutError = GatewayTimeoutError;
// Payload Too Large Error (413)
class PayloadTooLargeError extends Error {
    constructor(message) {
        super(message);
        this.status = 413;
        this.name = "PayloadTooLargeError";
    }
}
exports.PayloadTooLargeError = PayloadTooLargeError;
// Unsupported Media Type Error (415)
class UnsupportedMediaTypeError extends Error {
    constructor(message) {
        super(message);
        this.status = 415;
        this.name = "UnsupportedMediaTypeError";
    }
}
exports.UnsupportedMediaTypeError = UnsupportedMediaTypeError;
// Empty request body error
class EmptyRequestBodyError extends Error {
    constructor() {
        super("Please provide the required information");
        this.status = 400; // Bad Request
        this.name = "Please provide the required information";
    }
}
exports.EmptyRequestBodyError = EmptyRequestBodyError;
