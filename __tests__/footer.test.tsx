import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "next-themes";
import Footer from "@/components/footer/footer";
import type { ThemeProviderProps } from "next-themes/dist/types";

const mockSetTheme = jest.fn();

jest.mock("next-themes", () => ({
  ThemeProvider: ({ children }: Pick<ThemeProviderProps, "children">) => (
    <>{children}</>
  ),
  useTheme: () => ({
    theme: "light",
    setTheme: mockSetTheme,
    themes: ["light", "dark"],
    systemTheme: "light",
    resolvedTheme: "light",
  }),
}));

const renderComponent = () => {
  return render(
    <ThemeProvider attribute="class">
      <Footer />
    </ThemeProvider>
  );
};

describe("Footer Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders footer with accessible role and aria-label", () => {
    renderComponent();
    const footerElement = screen.getByRole("contentinfo", { name: "footer" });
    expect(footerElement).toBeInTheDocument();
  });

  it("renders footer content", () => {
    renderComponent();
    expect(
      screen.getByText("© 2024 Job Fair. All rights reserved.")
    ).toBeInTheDocument();
  });

  it("renders footer in a centered position with correct styling", () => {
    renderComponent();
    const footerElement = screen.getByText(
      "© 2024 Job Fair. All rights reserved."
    );
    expect(footerElement).toHaveClass("text-center", "text-sm", "mt-16");
  });
});
