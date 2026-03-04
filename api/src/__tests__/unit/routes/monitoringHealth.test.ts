import { describe, it, expect, vi, beforeEach } from "vitest";
import express, { Express } from "express";
import request from "supertest";
import healthRoute from "@/routes/monitoring/health";

const { wrappedDbMock, rawDbMock } = vi.hoisted(() => {
  const wrappedDbMock = vi.fn(() => ({
    first: vi.fn().mockResolvedValue({ id: 1 }),
  }));

  const rawDbMock = {
    raw: vi.fn().mockResolvedValue([{ probe: 1 }]),
  };

  return { wrappedDbMock, rawDbMock };
});

vi.mock("@/utils", () => ({
  default: {
    db: wrappedDbMock,
  },
}));

vi.mock("@/utils/db", () => ({
  db: rawDbMock,
  default: wrappedDbMock,
}));

describe("Monitoring Health Route", () => {
  let app: Express;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.get("/monitoring/health", healthRoute);
  });

  it("uses wrapped callable db probe first", async () => {
    const response = await request(app).get("/monitoring/health").expect(200);

    expect(response.body.checks.database.status).toBe("healthy");
    expect(wrappedDbMock).toHaveBeenCalledWith("t_user");
    expect(rawDbMock.raw).not.toHaveBeenCalled();
  });

  it("falls back to raw db probe when wrapped probe fails", async () => {
    wrappedDbMock.mockImplementation(() => {
      throw new Error("wrapped probe unavailable");
    });

    const response = await request(app).get("/monitoring/health").expect(200);

    expect(response.body.checks.database.status).toBe("healthy");
    expect(rawDbMock.raw).toHaveBeenCalledWith("SELECT 1");
  });

  it("returns 503 when wrapped and raw probes both fail", async () => {
    wrappedDbMock.mockImplementation(() => {
      throw new Error("wrapped probe unavailable");
    });
    rawDbMock.raw.mockImplementation(() => {
      throw new Error("raw probe unavailable");
    });

    const response = await request(app).get("/monitoring/health").expect(503);

    expect(response.body.checks.database.status).toBe("unhealthy");
    expect(response.body.checks.database.message).toContain("raw probe unavailable");
  });
});
