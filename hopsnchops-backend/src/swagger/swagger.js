const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { Development_server, Production_server, CLIENT_URL, SERVER_URL } = require("../config/env");

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HopsNChops Backend API',
      version: '1.0.0',
      description: 'API documentation for HopsNChops Backend',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: SERVER_URL,
        description: 'server URL',
      },
      {
        url: Development_server,
        description: 'Development server',
      },
      {
        url: Production_server,
        description: 'Production server',
      },
      {
        url: CLIENT_URL,
        description: 'Alternative development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './index.js', './src/swagger/*.yaml'], // Path to the API routes and YAML templates
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec, swaggerUi };
