import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { ThemeProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"
import "@testing-library/jest-dom"
import { ModeToggle } from "@/components/theme/mode"

const mockSetTheme = jest.fn()

jest.mock("next-themes", () => ({
  ThemeProvider: ({ children }: Pick<ThemeProviderProps, "children">) => <>{children}</>,
  useTheme: () => ({
    theme: "light",
    setTheme: mockSetTheme,
    themes: ["light", "dark"],
    systemTheme: "light",
    resolvedTheme: "light",
  }),
}))

describe("ModeToggle", () => {
  const renderComponent = () => {
    return render(
      <ThemeProvider attribute="class">
        <ModeToggle />
      </ThemeProvider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockSetTheme.mockClear()
  })

  it("renders both sun and moon icons", () => {
    renderComponent()
    const sunIcon = screen.getByTestId("sun-icon")
    const moonIcon = screen.getByTestId("moon-icon")
    expect(sunIcon).toBeInTheDocument()
    expect(moonIcon).toBeInTheDocument()
  })

  it("applies correct icon styles", () => {
    renderComponent()
    const sunIcon = screen.getByTestId("sun-icon")
    const moonIcon = screen.getByTestId("moon-icon")
    expect(sunIcon).toHaveClass("rotate-0", "scale-100")
    expect(moonIcon).toHaveClass("rotate-90", "scale-0")
  })

  it("handles theme toggle click", () => {
    const mock = jest.requireMock("next-themes")
    mock.useTheme = () => ({
      theme: "light",
      setTheme: mockSetTheme,
      themes: ["light", "dark"],
      systemTheme: "light",
      resolvedTheme: "light",
    })

    renderComponent()
    const themeButton = screen.getByRole("button")
    fireEvent.click(themeButton)
    expect(mockSetTheme).toHaveBeenCalledWith("dark")
  })

  it("toggles from dark to light theme", () => {
    const mock = jest.requireMock("next-themes")
    mock.useTheme = () => ({
      theme: "dark",
      setTheme: mockSetTheme,
      themes: ["light", "dark"],
      systemTheme: "dark",
      resolvedTheme: "dark",
    })

    renderComponent()
    const themeButton = screen.getByRole("button")
    fireEvent.click(themeButton)
    expect(mockSetTheme).toHaveBeenCalledWith("light")
  })

  it("has correct accessibility label", () => {
    renderComponent()
    const themeButton = screen.getByRole("button")
    expect(themeButton).toHaveAccessibleName("Toggle theme")
  })
})