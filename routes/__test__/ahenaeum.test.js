const app = require("../../app");
const request = require("supertest");

const { dbConnect, dbDisconnect } = require("../../mongoConfigTesting");

beforeAll(() => {
  dbConnect();
});

afterAll(async () => await dbDisconnect());

//Crate before ay action
