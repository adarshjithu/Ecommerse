// config/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ecommerse", // your project name
      version: "1.0.0",
      description: "API documentation for Ecommerse project",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1", // change port when deployed
      },
    ],
  },
  apis: ["./src/api/**/*.ts"], // path to your controllers/routes
};

export const swaggerSpec = swaggerJsdoc(options);
