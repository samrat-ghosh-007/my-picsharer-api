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
      { url: 'http://localhost:8080/api/v1' },
      { url: 'https://my-picsharer-api.onrender.com/api/v1' }, // Render URL
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64b0007d1a2b3f0012345678' },
            username: { type: 'string', example: 'samrat' },
            name: { type: 'string', example: 'Samrat Ghosh' },
            email: { type: 'string', format: 'email', example: 'samrat@example.com' },
            contact: { type: 'number', example: 9876543210 },
            avatarUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/v1621234567/avatar.jpg' },
            posts: {
              type: 'array',
              items: { $ref: '#/components/schemas/Post' }
            },
            saved: {
              type: 'array',
              items: { $ref: '#/components/schemas/Post' }
            },
          },
        },
        Post: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64b111aa2a2b9f0012123456' },
            user: { $ref: '#/components/schemas/User' },
            title: { type: 'string', example: 'My First Post' },
            description: { type: 'string', example: 'This is a great photo!' },
            image: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/v1621234567/post.jpg' },
            publicId: { type: 'string', example: 'posts/sample12345' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'], // adjust to your actual path
};

module.exports = swaggerJsdoc(swaggerOptions);
