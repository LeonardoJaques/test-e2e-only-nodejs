import { deepStrictEqual, ok } from "node:assert";
import { after, before, describe, it } from "node:test";

describe("API Products test", () => {
  let _server = {};
  let _globalToken = "";

  async function makeRequest(url, data) {
    const request = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        authorization: _globalToken,
      },
    });
    deepStrictEqual(request.status, 200);
    return request.json();
  }
  async function setToken() {
    const input = {
      user: "leonardojaques",
      password: "123",
    };

    const data = await makeRequest(`${BASE_URL}/login`, input);
    ok(data.token, "Token should be returned");
    _globalToken = `Bearer ${data.token}`;
  }
  const BASE_URL = "http://localhost:3000";
  before(async () => {
    _server = (await import("./api.js")).app;
    await new Promise((resolve) => {
      _server.once("listening", resolve);
    });
  });
  before(async () => setToken());
  // regras de negócio
  // 0 - 50 basic
  // 51 - 100 regular
  // 101 - 500 premium
  it("should create a premium product with success", async () => {
    const input = {
      description: "Funko Pop Michael Jordan",
      price: 101,
    };
    const data = await makeRequest(`${BASE_URL}/products`, input);
    deepStrictEqual(data.category, "premium");
  });
  it("should create a regular product with success", async () => {
    const input = {
      description: "Pilha recarregável",
      price: 90,
    };
    const data = await makeRequest(`${BASE_URL}/products`, input);
    deepStrictEqual(data.category, "regular");
  });
  it("should create a basic product with success", async () => {
    const input = {
      description: "Caneta Pentel",
      price: 26,
    };
    const data = await makeRequest(`${BASE_URL}/products`, input);
    deepStrictEqual(data.category, "basic");
  });

  after((done) => _server.close(done));
});
