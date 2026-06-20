process.env.JWT_SECRET = "test-secret-key-at-least-32-chars-long";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.GOOGLE_CLIENT_ID = "google-client-id";
process.env.GOOGLE_CLIENT_SECRET = "google-client-secret";
process.env.LINKEDIN_CLIENT_ID = "linkedin-client-id";
process.env.LINKEDIN_CLIENT_SECRET = "linkedin-client-secret";

const request = require("supertest");
const User = require("../models/User");
const { app } = require("../server");

jest.mock("../models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

describe("OAuth API Routes", () => {
  let originalFetch;
  const originalEnv = { ...process.env };

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  describe("Google OAuth", () => {
    test("GET /api/auth/google/start redirects to Google authorization page and sets cookie", async () => {
      const response = await request(app).get("/api/auth/google/start");
      expect(response.status).toBe(302);
      expect(response.header.location).toContain("accounts.google.com");
      expect(decodeURIComponent(response.header.location)).toContain(
        "redirect_uri=http://127.0.0.1"
      );
      expect(response.header["set-cookie"]).toBeDefined();
      expect(response.header["set-cookie"][0]).toContain("googleOAuthState");
    });

    test("GET /api/auth/google/start uses configured redirect URI when provided", async () => {
      process.env.GOOGLE_REDIRECT_URI = "https://api.example.com/api/auth/google/callback";

      const response = await request(app).get("/api/auth/google/start");

      expect(response.status).toBe(302);
      expect(decodeURIComponent(response.header.location)).toContain(
        "redirect_uri=https://api.example.com/api/auth/google/callback"
      );
    });

    test("GET /api/auth/google/callback fails if state cookie is missing or incorrect", async () => {
      const response = await request(app)
        .get("/api/auth/google/callback?code=test-code&state=wrong-state")
        .set("Cookie", ["googleOAuthState=correct-state"]);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain("state is invalid");
    });

    test("GET /api/auth/google/callback exchanges code, upserts user, and redirects to client dashboard", async () => {
      // Mock exchange tokens and profile fetches
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes("token")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ access_token: "mock-google-token" }),
          });
        }
        if (url.includes("userinfo")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                sub: "google-sub-123",
                email: "google.user@example.com",
                name: "Google User",
                picture: "google-pic.png",
              }),
          });
        }
        return Promise.reject(new Error("Unknown fetch url"));
      });

      // Mock database calls (user not existing first)
      User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      User.create.mockResolvedValue({
        _id: "google-user-id",
        name: "Google User",
        email: "google.user@example.com",
        googleId: "google-sub-123",
        authProvider: "google",
        save: jest.fn(),
      });

      const response = await request(app)
        .get("/api/auth/google/callback?code=mock-code&state=test-state")
        .set("Cookie", ["googleOAuthState=test-state"]);

      expect(response.status).toBe(302);
      expect(response.header.location).toContain("http://localhost:5173/login");
      expect(response.header.location).toContain("token=");
      expect(response.header.location).toContain("auth=success");
      expect(User.create).toHaveBeenCalled();
    });

    test("GET /api/auth/google/callback logs in an existing user without creating another one", async () => {
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes("token")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ access_token: "mock-google-token" }),
          });
        }
        if (url.includes("userinfo")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                sub: "google-sub-123",
                email: "existing@example.com",
                name: "Existing User",
                picture: "google-pic.png",
              }),
          });
        }
        return Promise.reject(new Error("Unknown fetch url"));
      });
      const existingUser = {
        _id: "existing-user-id",
        name: "Existing User",
        email: "existing@example.com",
        authProvider: "local",
        role: "student",
        save: jest.fn(),
      };
      User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(existingUser);

      const response = await request(app)
        .get("/api/auth/google/callback?code=mock-code&state=test-state")
        .set("Cookie", ["googleOAuthState=test-state"]);

      expect(response.status).toBe(302);
      expect(response.header.location).toContain("token=");
      expect(User.create).not.toHaveBeenCalled();
      expect(existingUser.googleId).toBe("google-sub-123");
      expect(existingUser.isEmailVerified).toBe(true);
      expect(existingUser.save).toHaveBeenCalled();
    });

    test("GET /api/auth/google/callback fails when client secret is missing", async () => {
      process.env.GOOGLE_CLIENT_SECRET = "";
      global.fetch = jest.fn();

      const response = await request(app)
        .get("/api/auth/google/callback?code=mock-code&state=test-state")
        .set("Cookie", ["googleOAuthState=test-state"]);

      expect(response.status).toBe(500);
      expect(response.body.message).toContain("OAuth is not configured");
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("POST /api/auth/google logs in direct client-side credentials", async () => {
      User.findOne.mockResolvedValue({
        _id: "google-user-id",
        name: "Google User",
        email: "google.user@example.com",
        googleId: "google-sub-123",
        authProvider: "google",
        save: jest.fn(),
      });

      const response = await request(app).post("/api/auth/google").send({
        email: "google.user@example.com",
        name: "Google User",
        googleId: "google-sub-123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe("google.user@example.com");
    });
  });

  describe("LinkedIn OAuth", () => {
    test("GET /api/auth/linkedin/start redirects to LinkedIn authorization page and sets cookie", async () => {
      const response = await request(app).get("/api/auth/linkedin/start");
      expect(response.status).toBe(302);
      expect(response.header.location).toContain("linkedin.com/oauth");
      expect(decodeURIComponent(response.header.location)).toContain(
        "redirect_uri=http://127.0.0.1"
      );
      expect(response.header["set-cookie"]).toBeDefined();
      expect(response.header["set-cookie"][0]).toContain("linkedinOAuthState");
    });

    test("GET /api/auth/linkedin/start uses SERVER_URL for default redirect URI", async () => {
      process.env.SERVER_URL = "https://api.example.com";

      const response = await request(app).get("/api/auth/linkedin/start");

      expect(response.status).toBe(302);
      expect(decodeURIComponent(response.header.location)).toContain(
        "redirect_uri=https://api.example.com/api/auth/linkedin/callback"
      );
    });

    test("GET /api/auth/linkedin/callback fails if state cookie is missing or incorrect", async () => {
      const response = await request(app)
        .get("/api/auth/linkedin/callback?code=test-code&state=wrong-state")
        .set("Cookie", ["linkedinOAuthState=correct-state"]);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain("state is invalid");
    });

    test("GET /api/auth/linkedin/callback exchanges code, upserts user, and redirects to client dashboard", async () => {
      // Mock exchange tokens and profile fetches
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes("accessToken")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ access_token: "mock-linkedin-token" }),
          });
        }
        if (url.includes("userinfo")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                sub: "linkedin-sub-123",
                email: "linkedin.user@example.com",
                name: "LinkedIn User",
                picture: "linkedin-pic.png",
              }),
          });
        }
        return Promise.reject(new Error("Unknown fetch url"));
      });

      // Mock database calls (user not existing first)
      User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      User.create.mockResolvedValue({
        _id: "linkedin-user-id",
        name: "LinkedIn User",
        email: "linkedin.user@example.com",
        linkedinId: "linkedin-sub-123",
        authProvider: "linkedin",
        save: jest.fn(),
      });

      const response = await request(app)
        .get("/api/auth/linkedin/callback?code=mock-code&state=test-state")
        .set("Cookie", ["linkedinOAuthState=test-state"]);

      expect(response.status).toBe(302);
      expect(response.header.location).toContain("http://localhost:5173/login");
      expect(response.header.location).toContain("token=");
      expect(response.header.location).toContain("auth=success");
      expect(User.create).toHaveBeenCalled();
    });

    test("GET /api/auth/linkedin/callback logs in an existing user without creating another one", async () => {
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes("accessToken")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ access_token: "mock-linkedin-token" }),
          });
        }
        if (url.includes("userinfo")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                sub: "linkedin-sub-123",
                email: "existing.linkedin@example.com",
                name: "LinkedIn Existing",
                picture: "linkedin-pic.png",
              }),
          });
        }
        return Promise.reject(new Error("Unknown fetch url"));
      });
      const existingUser = {
        _id: "existing-linkedin-user-id",
        name: "LinkedIn Existing",
        email: "existing.linkedin@example.com",
        authProvider: "local",
        role: "student",
        save: jest.fn(),
      };
      User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(existingUser);

      const response = await request(app)
        .get("/api/auth/linkedin/callback?code=mock-code&state=test-state")
        .set("Cookie", ["linkedinOAuthState=test-state"]);

      expect(response.status).toBe(302);
      expect(response.header.location).toContain("token=");
      expect(User.create).not.toHaveBeenCalled();
      expect(existingUser.linkedinId).toBe("linkedin-sub-123");
      expect(existingUser.save).toHaveBeenCalled();
    });

    test("POST /api/auth/linkedin logs in direct client-side credentials", async () => {
      User.findOne.mockResolvedValue({
        _id: "linkedin-user-id",
        name: "LinkedIn User",
        email: "linkedin.user@example.com",
        linkedinId: "linkedin-sub-123",
        authProvider: "linkedin",
        save: jest.fn(),
      });

      const response = await request(app).post("/api/auth/linkedin").send({
        email: "linkedin.user@example.com",
        name: "LinkedIn User",
        linkedinId: "linkedin-sub-123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe("linkedin.user@example.com");
    });
  });
});
