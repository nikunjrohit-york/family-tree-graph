import { render, screen } from "@testing-library/react";
import App from "../App";

describe("App", () => {
  it("renders the main heading", () => {
    render(<App />);
    expect(
      screen.getByText("Family Tree Graph Management System")
    ).toBeDefined();
  });

  it("renders the canvas area placeholder", () => {
    render(<App />);
    expect(screen.getByText("Canvas Area")).toBeDefined();
    expect(
      screen.getByText("Family tree visualization will appear here")
    ).toBeDefined();
  });
});
