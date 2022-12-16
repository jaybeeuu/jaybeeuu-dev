import { getThemeRoot } from "../features/theme";
import { getThemeSwitch } from "../features/nav-bar";

class MockMediaQuery {
  #matches = true;
  #changeListeners: ((ev: MediaQueryListEventMap["change"]) => any)[] = [];

  set matches (
    newMatches: boolean
  ) {
    this.#matches = newMatches;
    const event = new MediaQueryListEvent("change", { matches: newMatches });
    this.#changeListeners.forEach((listener) => {
      listener(event);
    });
  }

  get matches (): boolean {
    return this.#matches;
  }

  addEventListener<K extends keyof MediaQueryListEventMap>(
    type: K,
    listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => any
  ): void {
    this.#changeListeners = [...this.#changeListeners, listener];
  }

  removeEventListener<K extends keyof MediaQueryListEventMap>(
    type: K,
    listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => any
  ): void {
    this.#changeListeners.filter((candidate) => candidate !== listener);
  }
}

let isDarkQuery = new MockMediaQuery();

Cypress.on("window:before:load", window => {
  isDarkQuery = new MockMediaQuery();
  cy.stub(window, "matchMedia").withArgs("(prefers-color-scheme: dark)").returns(isDarkQuery);
});

context("Theme", (): void => {
  before(() => {
    cy.visit("/");
  });

  it("defaults to the dark theme.", (): void => {
    getThemeRoot().should("have.class", "dark");
  });

  it("changes to the light theme and back when the user toggles the OS theme.", (): void => {
    getThemeRoot().should("have.class", "dark");
    cy.then(() => {
      isDarkQuery.matches = false;
    });
    getThemeRoot().should("have.class", "light");
    cy.then(() => {
      isDarkQuery.matches = true;
    });
    getThemeRoot().should("have.class", "dark");
  });

  it("changes to the light theme when the them switch is switched and that persists across reloads.", (): void => {
    getThemeRoot().should("have.class", "dark");
    getThemeSwitch().click();
    getThemeRoot().should("have.class", "light");
    cy.reload();
    getThemeRoot().should("have.class", "light");
  });

  it("changes to the light theme and back even after the switch has been toggled.", (): void => {
    cy.then(() => {
      isDarkQuery.matches = false;
    });
    getThemeRoot().should("have.class", "light");
    cy.then(() => {
      isDarkQuery.matches = true;
    });
    getThemeRoot().should("have.class", "dark");
  });
});
