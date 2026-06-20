import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import authService from "../../services/authService";

jest.mock("../../services/authService", () => ({
  login: jest.fn(),
}));

jest.mock("../../components/UI/Toast", () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
}));

test("logs in and stores auth state", async () => {
  authService.login.mockResolvedValue({
    token: "token-123",
    user: { name: "Test User", email: "test@example.com" },
  });

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
  await userEvent.type(screen.getByLabelText(/^password$/i), "Password123!");
  await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

  expect(authService.login).toHaveBeenCalledWith({
    email: "test@example.com",
    password: "Password123!",
    rememberMe: true,
  });
  expect(localStorage.getItem("token")).toBe("token-123");
});
