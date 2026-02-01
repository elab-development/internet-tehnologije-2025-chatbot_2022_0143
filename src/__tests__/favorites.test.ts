import request from "supertest";

const BASE_URL = "http://localhost:3000";

describe("GET /api/favorites", () => {
  it("should return 401 when not logged in", async () => {
    const res = await request(BASE_URL).get("/api/favorites");
    expect(res.status).toBe(401);
  });
});
