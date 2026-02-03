import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock axios before importing the module under test
vi.mock("axios", () => {
  const post = vi.fn();
  const get = vi.fn();
  const use = vi.fn();
  const create = vi.fn(() => ({
    interceptors: { response: { use } },
    post,
    get,
  }));

  return {
    default: { create },
    create,
  };
});

import axios from "axios";
import { apiClient } from "@infrastructure/http/apiClient";

describe("ApiClient (infrastructure)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exposes a configured client instance", () => {
    const createdInstance = (apiClient as any).clientInstance;
    expect(createdInstance).toBeDefined();
    expect(typeof createdInstance.post).toBe("function");
    expect(typeof createdInstance.get).toBe("function");
    expect(createdInstance.interceptors).toBeDefined();
    expect(typeof createdInstance.interceptors.response.use).toBe("function");
  });

  it("delegates post and returns the response data", async () => {
    // Use the actual client instance created inside apiClient
    const createdInstance = (apiClient as any).clientInstance as any;
    createdInstance.post = vi.fn().mockResolvedValue({ data: { ok: true } });

    const result = await apiClient.post("/test-endpoint", { a: 1 });

    expect(createdInstance.post).toHaveBeenCalledWith("/test-endpoint", { a: 1 }, undefined);
    expect(result).toEqual({ ok: true });
  });

  it("delegates get and returns the response data", async () => {
    const createdInstance = (apiClient as any).clientInstance as any;
    createdInstance.get = vi.fn().mockResolvedValue({ data: { v: 42 } });

    const result = await apiClient.get("/some-path");

    expect(createdInstance.get).toHaveBeenCalledWith("/some-path", undefined);
    expect(result).toEqual({ v: 42 });
  });

  it("interceptor error handler transforms and rejects with ApiError shape", async () => {
    const createdInstance = (apiClient as any).clientInstance as any;
    // Ensure interceptors are (re)registered by invoking the setup method
    (apiClient as any).setupResponseInterceptors?.();

    const useFn = createdInstance.interceptors.response.use;

    expect(useFn).toBeDefined();

    // error handler is the second argument passed to use
    const errorHandler = useFn.mock.calls[0][1];

    const err = { message: "conn", code: "ECONN", response: { data: { reason: "down" } } };

    await expect(errorHandler(err)).rejects.toEqual({
      message: "conn",
      code: "ECONN",
      details: { reason: "down" },
    });
  });
});
