const app = require("../../app");
const request = require("supertest");
const db = require("../../configs/db.config.testing");

const Athenaeum = require("../../models/athenaeumModel");

const agent = request.agent(app);

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.close();
});

describe("GET /athenaeums", () => {
  // Clean and populate with fake data in-memory database for testing purposes
  beforeEach(async () => {
    await db.clear();
  });

  test("get all athenaeums", (done) => {
    agent
      .get("/athenaeums")
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.athenaeums).toBeDefined();
        done();
      });
  });

  test("sort ascending if sort query is defined", (done) => {
    agent
      .get("/athenaeums")
      .query("sort=-name")
      .then((res) => {
        expect(res.body.athenaeums[0].name).toEqual("athenaeum3");
        expect(
          res.body.athenaeums[res.body.athenaeums.length - 1].name
        ).toEqual("athenaeum1");
        done();
      });
  });

  test("sort descending if sort query is defined", (done) => {
    agent
      .get("/athenaeums")
      .query("sort=name")
      .then((res) => {
        expect(res.body.athenaeums[0].name).toEqual("athenaeum1");
        expect(
          res.body.athenaeums[res.body.athenaeums.length - 1].name
        ).toEqual("athenaeum3");
        done();
      });
  });
});

describe("GET /athenaeums/:id", () => {
  test("return athenaeum if id exists", (done) => {
    Athenaeum.create({ name: "athenaeumTest" }).then((ath) => {
      agent.get("/athenaeums/" + ath._id).then((res) => {
        expect(res.status).toBe(200);
        expect(res.body._id).toEqual(ath._id.toString());
        done();
      });
    });
  });
});

describe("POST /athenaems", () => {
  beforeEach(async () => {
    await db.clear();
  });
  test("create new athenaeum if input fields are valid", (done) => {
    agent
      .post("/athenaeums")
      .send({ name: "athenaeumTest", courses: ["course1", "course2"] })
      .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body.name).toBe("athenaeumTest");
        expect(res.body.courses.length).toBeGreaterThanOrEqual(0);
        done();
      });
  });

  test("return validation error if input fields are not valid", (done) => {
    agent
      .post("/athenaeums")
      .send({ name: "" })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.error).toBeTruthy();
        expect(res.body).toHaveProperty("errors");
        expect(res.body.errors[0].msg).toBe("Name field must not be empty");
        done();
      });
  });

  test("return validation error if input fields are duplicate", (done) => {
    agent
      .post("/athenaeums")
      .send({ name: "athenaeumTest" })
      .then(() => {
        agent
          .post("/athenaeums")
          .send({ name: "athenaeumTest" })
          .then((res) => {
            expect(res.status).toBe(400);
            expect(res.error).toBeTruthy();
            expect(res.body).toHaveProperty("errors");
            expect(res.body.errors[0].msg).toBe("athenaeumTest already exists");
            done();
          });
      });
  });
});

describe("PUT /athenaeums/:id", () => {
  test("update an athenaeum if input fields are valid", (done) => {
    Athenaeum.create({ name: "athenaeumTest" }).then((ath) => {
      agent
        .put("/athenaeums/" + ath._id)
        .send({ name: "athenaeumUp", courses: ["course2", "course3"] })
        .then((res) => {
          expect(res.status).toBe(201);
          expect(res.body.name).toBe("athenaeumUp");
          expect(res.body.courses.length).toBeGreaterThan(0);
          expect(res.body._id).toEqual(ath._id.toString());
          done();
        });
    });
  });
});

describe("delete /athenaeums/:id", () => {
  test("update an athenaeum if input fields are valid", (done) => {
    Athenaeum.create({ name: "athenaeumTest" }).then((ath) => {
      agent.delete("/athenaeums/" + ath._id).then((res) => {
        expect(res.status).toBe(204);
        done();
      });
    });
  });
});
