import request from "supertest";

const BASE_URL = "http://localhost:3000";

describe("GET /api/destinations", () => {
  it("should return 200", async () => {
    const res = await request(BASE_URL).get("/api/destinations");
    expect(res.status).toBe(200);
  });
});
