import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Register from "./Register";
import authService from "../../services/authService";

jest.mock("../../services/authService", () => ({
  register: jest.fn(),
}));

jest.mock("../../components/UI/Toast", () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
}));

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  jest.clearAllMocks();
});

test("disables registration until password rules pass", async () => {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

  await userEvent.type(screen.getByLabelText(/full name/i), "Test User");
  await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
  await userEvent.type(screen.getByLabelText(/^password$/i), "short");

  expect(screen.getByRole("button", { name: /create account/i })).toBeDisabled();
  expect(screen.getByText(/uppercase letter/i)).toBeInTheDocument();
  expect(authService.register).not.toHaveBeenCalled();
});

test("submits valid registration and stores returned session", async () => {
  authService.register.mockResolvedValue({
    success: true,
    token: "token-123",
    user: { name: "Test User", email: "test@example.com" },
  });

  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

  await userEvent.type(screen.getByLabelText(/full name/i), "Test User");
  await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
  await userEvent.type(screen.getByLabelText(/^password$/i), "Password123!");
  await userEvent.type(screen.getByLabelText(/^confirm password$/i), "Password123!");
  await userEvent.click(screen.getByRole("button", { name: /create account/i }));

  expect(authService.register).toHaveBeenCalledWith({
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
    rememberMe: true,
  });
  expect(localStorage.getItem("token")).toBe("token-123");
});
