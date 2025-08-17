import express from 'express';
import { ProductRepository } from './productRepository';
import { ProductService } from './productService';
import { ProductController } from './productController';

const productRouter = express.Router();
const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const controller = new ProductController(productService);

export default productRouter;

