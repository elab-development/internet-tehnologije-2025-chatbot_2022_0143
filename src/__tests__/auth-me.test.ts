import request from "supertest";

const BASE_URL = "http://localhost:3000";

describe("GET /api/auth/me", () => {
  it("should return 200", async () => {
    const res = await request(BASE_URL).get("/api/auth/me");
    expect(res.status).toBe(200);
  });
});
