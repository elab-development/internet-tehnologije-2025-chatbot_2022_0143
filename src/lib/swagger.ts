import path from "path";
import { createSwaggerSpec } from "next-swagger-doc";

export const getSwaggerSpec = () =>
  createSwaggerSpec({
    apiFolder: path.join(process.cwd(), "src/app/api"),
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Travel Chatbot API",
        version: "1.0.0",
      },
    },
  });