const swaggerJsDoc = require("swagger-jsdoc");
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Start2Impact Node Project",
      version: "1.0.0",
      description: "placeholder",
    },
    servers: [
      {
        ulr: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);

module.exports = specs;
