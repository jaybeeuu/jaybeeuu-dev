import { getThemeRoot } from "../features/theme";
import { getThemeSwitch } from "../features/nav-bar";

context("Theme", (): void => {
  before(() => {
    cy.visit("/");
  });

  it("defaults to the dark theme.", (): void => {
    getThemeRoot().should("have.class", "dark");
  });

  it("changes to the light theme when the them switch is switched.", (): void => {
    getThemeSwitch().click();
    getThemeRoot().should("have.class", "light");
  });
});
