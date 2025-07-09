// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Social API',
      version: '1.0.0',
      description: 'REST API for auth, posts, save/unsave, profile',
    },
    servers: [
      { url: 'http://localhost:8080/api/v1' }   // dev server
      // add your Render URL here after deployment
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
    security: [{ bearerAuth: [] }],            // apply globally
  },
  // Tell swagger‑jsdoc where to look for annotations
  apis: ['./src/routes/*.js'],                 // adjust if routes live elsewhere
};



module.exports = swaggerJsdoc(swaggerOptions);
