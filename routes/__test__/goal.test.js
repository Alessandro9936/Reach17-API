const app = require("../../app");
const request = require("supertest");
const db = require("../../configs/db.config.testing");

const Goal = require("../../models/goalModel");

const agent = request.agent(app);

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.close();
});

describe("GET /goals", () => {
  // Clean and populate with fake data in-memory database for testing purposes
  beforeEach(async () => {
    await db.clear();
  });

  test("get all goals", (done) => {
    agent
      .get("/goals")
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.goals).toBeDefined();
        done();
      });
  });

  test("sort descending if sort query is defined", (done) => {
    agent
      .get("/goals")
      .query("sort=-name")
      .then((res) => {
        expect(res.body.goals[0].name).toEqual("goal3");
        expect(res.body.goals[res.body.goals.length - 1].name).toEqual("goal1");
        done();
      });
  });

  test("sort ascending if sort query is defined", (done) => {
    agent
      .get("/goals")
      .query("sort=name")
      .then((res) => {
        expect(res.body.goals[0].name).toEqual("goal1");
        expect(res.body.goals[res.body.goals.length - 1].name).toEqual("goal3");
        done();
      });
  });
});

describe("GET /goals/:id", () => {
  test("return goal if id exists", (done) => {
    Goal.create({ name: "goalTest", description: "goalTest" }).then((goal) => {
      agent.get("/goals/" + goal._id).then((res) => {
        expect(res.status).toBe(200);
        expect(res.body._id).toEqual(goal._id.toString());
        done();
      });
    });
  });
});

describe("POST /goals", () => {
  beforeEach(async () => {
    await db.clear();
  });
  test("create new goal if input fields are valid", (done) => {
    agent
      .post("/goals")
      .send({
        name: "goalTest",
        description: "goalTest",
        courses: ["course1", "course3"],
      })
      .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body.name).toBe("goalTest");
        expect(res.body.courses.length).toBeGreaterThanOrEqual(0);
        done();
      });
  });

  test("return validation error if input field name is not defined", (done) => {
    agent
      .post("/goals")
      .send({ name: "", description: "testGoal" })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.error).toBeTruthy();
        expect(res.body).toHaveProperty("errors");
        expect(res.body.errors[0].msg).toBe(
          "Goal name field must not be empty"
        );
        done();
      });
  });

  test("return validation error if input field description is not defined", (done) => {
    agent
      .post("/goals")
      .send({ name: "testGoal", description: "" })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.error).toBeTruthy();
        expect(res.body).toHaveProperty("errors");
        expect(res.body.errors[0].msg).toBe(
          "Goal description field must not be empty"
        );
        done();
      });
  });

  test("return validation error if input fields are duplicate", (done) => {
    agent
      .post("/goals")
      .send({ name: "goalTest", description: "goalTest" })
      .then(() => {
        agent
          .post("/goals")
          .send({ name: "goalTest", description: "goalTest" })
          .then((res) => {
            expect(res.status).toBe(400);
            expect(res.error).toBeTruthy();
            expect(res.body).toHaveProperty("errors");
            expect(res.body.errors[0].msg).toBe("goalTest already exists");
            done();
          });
      });
  });
});

describe("PUT /goals/:id", () => {
  test("update a goal if input fields are valid", (done) => {
    Goal.create({ name: "goalTest", description: "goalTest" }).then((goal) => {
      agent
        .put("/goals/" + goal._id)
        .send({
          name: "goalTestUpdated",
          description: "goalTestUpdated",
          courses: ["course1"],
        })
        .then((res) => {
          expect(res.status).toBe(201);
          expect(res.body.name).toBe("goalTestUpdated");
          expect(res.body.description).toBe("goalTestUpdated");
          expect(res.body.courses.length).toBeGreaterThan(0);
          expect(res.body._id).toEqual(goal._id.toString());
          done();
        });
    });
  });
});

describe("delete /goals/:id", () => {
  test("update agoal if input fields are valid", (done) => {
    Goal.create({
      name: "goalTestUpdated",
      description: "goalTestUpdated",
    }).then((goal) => {
      agent.delete("/goals/" + goal._id).then((res) => {
        expect(res.status).toBe(204);
        done();
      });
    });
  });
});
