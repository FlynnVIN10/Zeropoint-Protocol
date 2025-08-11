// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { checkIntent } from "../guards/synthient.guard.js";

describe("Basic Functionality Tests", () => {
  it("should pass Zeroth Principle check for valid intent", () => {
    const result = checkIntent("test with good intent");
    expect(result).toBe(true);
  });

  it("should fail Zeroth Principle check for invalid intent", () => {
    const result = checkIntent("harmful intent");
    expect(result).toBe(false);
  });

  it("should handle async operations", async () => {
    const result = await Promise.resolve("test");
    expect(result).toBe("test");
  });
});
