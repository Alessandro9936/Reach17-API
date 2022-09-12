const app = require("../../app");
const request = require("supertest");
const db = require("../../configs/db.config.testing");

const athenaeum = require("../../models/athenaeumModel");

const agent = request.agent(app);

beforeAll(async () => {
  await db.connect();
});

beforeEach(async () => {
  await db.clear();
});

afterAll(async () => {
  await db.close();
});

describe("POST /athenaems => Create a new athenaeum", () => {
  test("Create successfully a new athenaeum", (done) => {
    agent
      .post("/athenaeums")
      .send({ name: "athenaeum" })
      .expect(201)
      .then((res) => {
        ////

        athenaeum.countDocuments().then((doc) => console.log(doc));
        ///

        athenaeum.findById(res.body._id).then((ath) => {
          expect(ath.name).toEqual("athenaeum");
          expect(ath._id).toBeTruthy();
        });
        done();
      });
  });

  test("fail to create a new athenaeum if input fields are empty", (done) => {
    agent
      .post("/athenaeums")
      .send({ name: "" })
      .expect(400)
      .then((res) => {
        expect(res.error).toBeTruthy();
        done();
      });
  });
});
