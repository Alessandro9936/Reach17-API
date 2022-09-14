const app = require("../../app");
const request = require("supertest");
const db = require("../../configs/db.config.testing");

const Course = require("../../models/courseModel");

const agent = request.agent(app);

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.close();
});

describe("GET /courses", () => {
  // Clean and populate with fake data in-memory database for testing purposes
  beforeEach(async () => {
    await db.clear();
  });

  test("get all courses", (done) => {
    agent
      .get("/courses")
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.courses).toBeDefined();
        expect(res.body.courses.length).toBeGreaterThan(0);
        done();
      });
  });

  test("filter courses by goal name", (done) => {
    agent
      .post("/courses")
      .send({
        name: "courseFilteringByGoal",
        description: "courseFilteringByGoal",
        goals: ["goal1"],
        athenaeums: ["athenaeum2"],
      })
      .then(() => {
        agent
          .get("/courses")
          .query("goals=goal1")
          .then((res) => {
            expect(res.body.courses.length).toBe(1);
            expect(res.body.courses[0].name).toBe("courseFilteringByGoal");
            expect(res.body.courses[0].description).toBe(
              "courseFilteringByGoal"
            );
            done();
          });
      });
  });

  test("return empty array if goal name in query doesn't exists", (done) => {
    agent
      .post("/courses")
      .send({
        name: "courseFilteringByGoal",
        description: "courseFilteringByGoal",
        goals: ["goal1"],
        athenaeums: ["athenaeum2"],
      })
      .then(() => {
        agent
          .get("/courses")
          .query("goals=IdontExist")
          .then((res) => {
            expect(res.body.courses.length).toBe(0);
            done();
          });
      });
  });

  test("filter courses by course name", (done) => {
    agent
      .post("/courses")
      .send({
        name: "courseFilteringByName",
        description: "courseFilteringByName",
        goals: ["goal1"],
        athenaeums: ["athenaeum2"],
      })
      .then(() => {
        agent
          .get("/courses")
          .query("name=courseFilteringByName")
          .then((res) => {
            expect(res.body.courses.length).toBe(1);
            expect(res.body.courses[0].name).toBe("courseFilteringByName");
            expect(res.body.courses[0].description).toBe(
              "courseFilteringByName"
            );
            done();
          });
      });
  });

  test("return empty array if course name in query doesn't exists", (done) => {
    agent
      .post("/courses")
      .send({
        name: "courseFilteringByName",
        description: "courseFilteringByName",
        goals: ["goal1"],
        athenaeums: ["athenaeum2"],
      })
      .then(() => {
        agent
          .get("/courses")
          .query("name=IdontExist")
          .then((res) => {
            expect(res.body.courses.length).toBe(0);
            done();
          });
      });
  });

  test("filter courses by athenaeum name", (done) => {
    agent
      .post("/courses")
      .send({
        name: "courseFilteringByAthenaeum",
        description: "courseFilteringByAthenaeum",
        goals: ["goal1"],
        athenaeums: ["athenaeum2"],
      })
      .then(() => {
        agent
          .get("/courses")
          .query("athenaeums=athenaeum2")
          .then((res) => {
            expect(res.body.courses.length).toBe(1);
            expect(res.body.courses[0].name).toBe("courseFilteringByAthenaeum");
            expect(res.body.courses[0].description).toBe(
              "courseFilteringByAthenaeum"
            );
            done();
          });
      });
  });

  test("return empty array if athenaeum name in query doesn't exists", (done) => {
    agent
      .post("/courses")
      .send({
        name: "courseFilteringByAthenaeum",
        description: "courseFilteringByAthenaeum",
        goals: ["goal1"],
        athenaeums: ["athenaeum2"],
      })
      .then(() => {
        agent
          .get("/courses")
          .query("athenaeums=IdontExist")
          .then((res) => {
            expect(res.body.courses.length).toBe(0);
            done();
          });
      });
  });
});

describe("GET /courses/:id", () => {
  test("return course if id exists", (done) => {
    Course.create({ name: "nameTest", description: "nameTest" }).then(
      (course) => {
        agent.get("/courses/" + course._id).then((res) => {
          expect(res.status).toBe(200);
          expect(res.body._id).toEqual(course._id.toString());
          done();
        });
      }
    );
  });
});

describe("POST /courses", () => {
  beforeEach(async () => {
    await db.clear();
  });

  test("create new course if input fields are valid", (done) => {
    agent
      .post("/courses")
      .send({
        name: "courseTest",
        description: "courseTest",
        goals: ["goal1", "goal3"],
        athenaeums: ["athenaeum1", "athenaeum2"],
      })
      .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body.name).toBe("courseTest");
        expect(res.body.goals.length).toBeGreaterThanOrEqual(0);
        expect(res.body.athenaeums.length).toBeGreaterThanOrEqual(0);
        done();
      });
  });

  test("return validation error if input field name is not defined", (done) => {
    agent
      .post("/courses")
      .send({ name: "", description: "courseTest" })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.error).toBeTruthy();
        expect(res.body).toHaveProperty("errors");
        expect(res.body.errors[0].msg).toBe(
          "Course name field must not be empty"
        );
        done();
      });
  });

  test("return validation error if input field description is not defined", (done) => {
    agent
      .post("/courses")
      .send({ name: "courseTest", description: "" })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.error).toBeTruthy();
        expect(res.body).toHaveProperty("errors");
        expect(res.body.errors[0].msg).toBe(
          "Course description field must not be empty"
        );
        done();
      });
  });

  test("return validation error if input fields are duplicate", (done) => {
    agent
      .post("/courses")
      .send({ name: "courseTest", description: "courseTest" })
      .then(() => {
        agent
          .post("/courses")
          .send({ name: "courseTest", description: "courseTest" })
          .then((res) => {
            expect(res.status).toBe(400);
            expect(res.error).toBeTruthy();
            expect(res.body).toHaveProperty("errors");
            expect(res.body.errors[0].msg).toBe("courseTest already exists");
            done();
          });
      });
  });
});

describe("PUT /courses/:id", () => {
  test("update a course if input fields are valid", (done) => {
    Course.create({ name: "courseTest", description: "courseTest" }).then(
      (course) => {
        agent
          .put("/courses/" + course._id)
          .send({
            name: "courseTestUpdated",
            description: "courseTestUpdated",
            goals: ["goal1"],
          })
          .then((res) => {
            expect(res.status).toBe(201);
            expect(res.body.name).toBe("courseTestUpdated");
            expect(res.body.description).toBe("courseTestUpdated");
            expect(res.body.goals.length).toBeGreaterThan(0);
            expect(res.body.athenaeums.length).toBe(0);
            expect(res.body._id).toEqual(course._id.toString());
            done();
          });
      }
    );
  });
});

describe("delete /courses/:id", () => {
  test("update course if input fields are valid", (done) => {
    Course.create({
      name: "courseTest",
      description: "courseTest",
    }).then((course) => {
      agent.delete("/courses/" + course._id).then((res) => {
        expect(res.status).toBe(204);
        done();
      });
    });
  });
});
