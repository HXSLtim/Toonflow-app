import { describe, it, expect, vi, beforeEach } from "vitest";
import express, { Express } from "express";
import request from "supertest";
import healthRoute from "@/routes/monitoring/health";

vi.mock("@/utils", () => ({
  default: {
    db: {
      select: vi.fn(() => ({
        first: vi.fn().mockResolvedValue({ probe: 1 }),
      })),
    },
  },
}));

vi.mock("@/utils/db", () => ({
  default: vi.fn(() => ({
    first: vi.fn().mockResolvedValue({ probe: 1 }),
  })),
  db: {
    raw: vi.fn().mockResolvedValue([{ probe: 1 }]),
  },
}));

describe("Monitoring Health Route", () => {
  let app: Express;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.get("/monitoring/health", healthRoute);
  });

  it("uses wrapped db probe when select-first is available", async () => {
    const u = (await import("@/utils")).default;
    const dbModule = await import("@/utils/db");

    const response = await request(app).get("/monitoring/health").expect(200);

    expect(response.body.status).toBeDefined();
    expect(response.body.checks.database.status).toBe("healthy");
    expect((u.db.select as any)).toHaveBeenCalledWith(1);
    expect((dbModule.db.raw as any)).not.toHaveBeenCalled();
  });

  it("falls back to low-level db module when wrapped client probe fails", async () => {
    const u = (await import("@/utils")).default;
    const dbModule = await import("@/utils/db");

    (u.db.select as any).mockImplementation(() => {
      throw new Error("wrapped probe unavailable");
    });

    const response = await request(app).get("/monitoring/health").expect(200);

    expect(response.body.checks.database.status).toBe("healthy");
    expect((dbModule.db.raw as any)).toHaveBeenCalledWith("SELECT 1");
  });

  it("returns 503 when all probe methods are unavailable", async () => {
    const u = (await import("@/utils")).default;
    const dbModule = await import("@/utils/db");

    (u.db.select as any).mockImplementation(() => {
      throw new Error("wrapped probe unavailable");
    });
    (dbModule.db.raw as any).mockImplementation(() => {
      throw new Error("raw probe unavailable");
    });

    const response = await request(app).get("/monitoring/health").expect(503);

    expect(response.body.checks.database.status).toBe("unhealthy");
    expect(response.body.checks.database.message).toContain("raw probe unavailable");
  });
});
