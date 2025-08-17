import express from 'express';
import authRouter from '../api/user/auth/authRouter';
import productRouter from '../api/user/product/productRoutes';
const userRoutes = express.Router();

userRoutes.use('/auth',authRouter) 
userRoutes.use("/product",productRouter)

export default userRoutes;