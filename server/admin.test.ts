import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";

describe("Admin Authentication", () => {
  it("should validate correct admin password", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.admin.validatePassword({ password: "4265" });

    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
    expect(result.token).not.toBe("");
  });

  it("should reject incorrect admin password", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.admin.validatePassword({ password: "wrongpassword" });

    expect(result.success).toBe(false);
    expect(result.token).toBe("");
  });

  it("should reject empty password", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.admin.validatePassword({ password: "" });

    expect(result.success).toBe(false);
  });
});
