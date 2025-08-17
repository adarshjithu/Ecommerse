import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string|any;
    user:any ; // Add your custom property here
  }
}