import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Admin from "./Admin";
import adminService from "../../services/adminService";

jest.mock("../../services/adminService", () => ({
  getSummary: jest.fn(),
  exportReports: jest.fn(),
  deleteUser: jest.fn(),
}));

jest.mock("../../components/UI/Toast", () => ({
  showError: jest.fn(),
  showSuccess: jest.fn(),
}));

test("blocks non-admin users", () => {
  localStorage.setItem("user", JSON.stringify({ role: "student" }));

  render(
    <MemoryRouter>
      <Admin />
    </MemoryRouter>
  );

  expect(screen.getByRole("heading", { name: /admin access required/i })).toBeInTheDocument();
});

test("renders admin summary and exports reports", async () => {
  localStorage.setItem(
    "user",
    JSON.stringify({ _id: "admin-1", role: "admin" })
  );
  adminService.getSummary.mockResolvedValue({
    summary: {
      totalUsers: 3,
      totalInterviews: 5,
      totalAtsReports: 4,
      activeUsers: 1,
    },
    users: [
      {
        _id: "user-1",
        name: "Test User",
        email: "test@example.com",
        authProvider: "local",
        role: "student",
        isEmailVerified: true,
      },
    ],
  });
  adminService.exportReports.mockResolvedValue({ success: true, interviews: [] });
  global.URL.createObjectURL = jest.fn(() => "blob:test");
  global.URL.revokeObjectURL = jest.fn();
  jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

  render(
    <MemoryRouter>
      <Admin />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText("Platform dashboard")).toBeInTheDocument();
  });

  expect(screen.getByText("test@example.com")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: /export reports/i }));
  expect(adminService.exportReports).toHaveBeenCalled();
});

test("deletes a user from the table", async () => {
  localStorage.setItem(
    "user",
    JSON.stringify({ _id: "admin-1", role: "admin" })
  );
  adminService.getSummary.mockResolvedValue({
    summary: {},
    users: [
      {
        _id: "user-1",
        name: "Test User",
        email: "test@example.com",
        authProvider: "local",
        role: "student",
        isEmailVerified: false,
      },
    ],
  });
  adminService.deleteUser.mockResolvedValue({ success: true });

  render(
    <MemoryRouter>
      <Admin />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  await userEvent.click(screen.getByRole("button", { name: /delete/i }));
  await waitFor(() => {
    expect(screen.queryByText("test@example.com")).not.toBeInTheDocument();
  });
});
