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
        url: 'http://3.79.234.138:3000/api-docs/#/',
        description: 'Global server',
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
    },
  },
  apis: ['./routes/*.js'],
}

const swaggerSpec = swaggerJSDoc(options)

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

module.exports = setupSwagger