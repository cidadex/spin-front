import "@testing-library/jest-dom";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
class MockResponse {
  status: number;
  ok: boolean;
  statusText: string;
  private _json: unknown;

  constructor(body: unknown, init?: { status?: number; statusText?: string }) {
    this._json = body;
    this.status = init?.status || 200;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = init?.statusText || "";
  }

  async json() {
    if (typeof this._json === "string") {
      return JSON.parse(this._json);
    }
    return this._json;
  }
}

global.Response = MockResponse as unknown as typeof Response;

export const mockedUseRouterPush = jest.fn();
export const mockedUseRouterReplace = jest.fn();
export const mockedUseRouter = jest.fn(() => {
  return { push: mockedUseRouterPush, replace: mockedUseRouterReplace };
});
export const mockedUsePathname = jest.fn();
export const mockedUseSearchParams = jest.fn(() => {
  return { get: () => null };
});

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => mockedUseRouter()),
  usePathname: jest.fn(() => mockedUsePathname()),
  useSearchParams: jest.fn(() => mockedUseSearchParams()),
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;
