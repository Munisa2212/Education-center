const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Learning Centre API',
      version: '1.0.0',
      description: 'API documentation for Learning Centre platform',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            role: { type: 'string', example: 'admin' },
            email: { type: 'string', example: 'user@example.com' },
            password: { type: 'string', example: 'hashedpassword' },
            phone: { type: 'string', example: '+998901234567' },
            image: { type: 'string', example: 'user.png' },
            first_name: { type: 'string', example: 'John' },
            last_name: { type: 'string', example: 'Doe' },
          },
        },
        Centre: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'ABC Learning Centre' },
            phone: { type: 'string', example: '+998901234567' },
            location: { type: 'string', example: 'Tashkent, Uzbekistan' },
            region_id: { type: 'integer', example: 2 },
            branch_number: { type: 'integer', example: 5 },
            ceo_id: { type: 'integer', example: 1 },
            description: { type: 'string', example: 'Best learning center' },
          },
        },
        Branch: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Downtown Branch' },
            phone: { type: 'string', example: '+998901234567' },
            image: { type: 'string', example: 'branch.png' },
            location: { type: 'string', example: 'Tashkent, Chilonzor' },
            region_id: { type: 'integer', example: 1 },
            learningCentre_id: { type: 'integer', example: 2 },
          },
        },
        Resource: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'JavaScript Basics' },
            user_id: { type: 'integer', example: 1 },
            image: { type: 'string', example: 'js-course.png' },
            description: {
              type: 'string',
              example: 'Learn JavaScript from scratch',
            },
            category_id: { type: 'integer', example: 3 },
            file: { type: 'string', example: 'course.pdf' },
            link: { type: 'string', example: 'http://example.com/resource' },
          },
        },
        Registration: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            learningCentre_id: { type: 'integer', example: 2 },
            branch_id: { type: 'integer', example: 3 },
            user_id: { type: 'integer', example: 4 },
            date: { type: 'string', format: 'date', example: '2024-03-24' },
          },
        },
        Like: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            learningCentre_id: { type: 'integer', example: 2 },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            comment: { type: 'string', example: 'Great learning centre!' },
            star: { type: 'integer', example: 5 },
            learningCentre_id: { type: 'integer', example: 2 },
          },
        },
      },
    },
    paths: {
      '/users': {
        get: {
          summary: 'Get all users',
          tags: ['User'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'List of users',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
      },
      '/centres': {
        get: {
          summary: 'Get all learning centres',
          tags: ['Centre'],
          responses: {
            200: {
              description: 'List of centres',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Centre' },
                  },
                },
              },
            },
          },
        },
      },
      '/branches': {
        get: {
          summary: 'Get all branches',
          tags: ['Branch'],
          responses: {
            200: {
              description: 'List of branches',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Branch' },
                  },
                },
              },
            },
          },
        },
      },
      '/resources': {
        get: {
          summary: 'Get all resources',
          tags: ['Resource'],
          responses: {
            200: {
              description: 'List of resources',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Resource' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
}

const swaggerSpec = swaggerJSDoc(options)

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

module.exports = setupSwagger
