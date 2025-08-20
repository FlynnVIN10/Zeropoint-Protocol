import { describe, it, expect, beforeEach } from "@jest/globals";
import { ApplianceStatusController } from "../../src/controllers/appliance-status.controller";

describe("Appliance Status API", () => {
  let controller: ApplianceStatusController;

  beforeEach(async () => {
    controller = new ApplianceStatusController();
  });

  describe("GET /api/status/version", () => {
    it("should return appliance status with required fields", async () => {
      const result = await controller.getVersion();

      expect(result).toBeDefined();
      expect(result.appliance_id).toBeDefined();
      expect(result.commit).toBeDefined();
      expect(result.phase).toBeDefined();
      expect(result.version).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it("should include appliance_id in correct format", async () => {
      const result = await controller.getVersion();

      expect(result.appliance_id).toMatch(/^ZP-[A-Z0-9]{8}$/);
      expect(typeof result.appliance_id).toBe("string");
    });

    it("should include commit hash", async () => {
      const result = await controller.getVersion();

      expect(result.commit).toBeDefined();
      expect(typeof result.commit).toBe("string");
    });

    it("should include phase information", async () => {
      const result = await controller.getVersion();

      expect(result.phase).toBe("A");
      expect(typeof result.phase).toBe("string");
    });

    it("should include version information", async () => {
      const result = await controller.getVersion();

      expect(result.version).toBeDefined();
      expect(typeof result.version).toBe("string");
      expect(result.version).toMatch(/^\d+\.\d+\.\d+/);
    });

    it("should include timestamp", async () => {
      const result = await controller.getVersion();

      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).getTime()).toBeGreaterThan(0);
    });

    it("should include additional metadata", async () => {
      const result = await controller.getVersion();

      expect(result.build_date).toBeDefined();
      expect(result.runtime).toBeDefined();
      expect(result.tinygrad_version).toBeDefined();
      expect(result.simulation_mode).toBe(true);
    });

    it("should include simulation mode indicator", async () => {
      const result = await controller.getVersion();

      expect(result.simulation_mode).toBe(true);
      expect(typeof result.simulation_mode).toBe("boolean");
    });

    it("should include tinygrad version", async () => {
      const result = await controller.getVersion();

      expect(result.tinygrad_version).toBeDefined();
      expect(typeof result.tinygrad_version).toBe("string");
    });

    it("should include runtime information", async () => {
      const result = await controller.getVersion();

      expect(result.runtime).toBeDefined();
      expect(result.runtime.node_version).toBeDefined();
      expect(result.runtime.platform).toBeDefined();
      expect(result.runtime.arch).toBeDefined();
    });
  });

  describe("GET /api/status/health", () => {
    it("should return health status", async () => {
      const result = await controller.getHealth();

      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it("should include health checks", async () => {
      const result = await controller.getHealth();

      expect(result.checks).toBeDefined();
      expect(result.checks.database).toBeDefined();
      expect(result.checks.tinygrad).toBeDefined();
      expect(result.checks.simulation).toBeDefined();
    });

    it("should indicate simulation mode", async () => {
      const result = await controller.getHealth();

      expect(result.simulation_mode).toBe(true);
      expect(result.simulation_status).toBe("ACTIVE");
    });
  });

  describe("GET /api/status/diag", () => {
    it("should return diagnostic information", async () => {
      const result = await controller.getDiagnostics();

      expect(result).toBeDefined();
      expect(result.device_inventory).toBeDefined();
      expect(result.driver_hashes).toBeDefined();
      expect(result.tinygrad_parity).toBeDefined();
      expect(result.energy_checks).toBeDefined();
      expect(result.security_checks).toBeDefined();
    });

    it("should include device inventory", async () => {
      const result = await controller.getDiagnostics();

      expect(result.device_inventory.cpu).toBeDefined();
      expect(result.device_inventory.memory).toBeDefined();
      expect(result.device_inventory.storage).toBeDefined();
      expect(result.device_inventory.network).toBeDefined();
      expect(result.device_inventory.gpu).toBeDefined();
    });

    it("should include driver hashes", async () => {
      const result = await controller.getDiagnostics();

      expect(result.driver_hashes.cpu_driver).toBeDefined();
      expect(result.driver_hashes.gpu_driver).toBeDefined();
      expect(result.driver_hashes.network_driver).toBeDefined();
      expect(result.driver_hashes.storage_driver).toBeDefined();
    });

    it("should include tinygrad parity results", async () => {
      const result = await controller.getDiagnostics();

      expect(result.tinygrad_parity.status).toBe("PASS");
      expect(result.tinygrad_parity.tolerance).toBeLessThan(1e-6);
      expect(result.tinygrad_parity.test_cases).toBeGreaterThan(0);
    });

    it("should include energy checks", async () => {
      const result = await controller.getDiagnostics();

      expect(result.energy_checks.power_consumption).toBeDefined();
      expect(result.energy_checks.energy_efficiency).toBeDefined();
      expect(result.energy_checks.carbon_footprint).toBeDefined();
    });

    it("should include security checks", async () => {
      const result = await controller.getDiagnostics();

      expect(result.security_checks.container_isolation).toBeDefined();
      expect(result.security_checks.threat_model).toBeDefined();
      expect(result.security_checks.vulnerabilities).toBeDefined();
    });
  });
});
