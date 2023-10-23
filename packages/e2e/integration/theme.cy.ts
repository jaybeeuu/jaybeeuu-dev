import { getThemeRoot } from "../features/theme";
import { getThemeSwitch } from "../features/nav-bar";

class MockMediaQuery {
  #matches = true;
  #changeListeners: ((ev: MediaQueryListEventMap["change"]) => void)[] = [];
  #resolveHasListeners = (): void => {};
  #hasListenersPromise = new Promise<true>((resolve) => this.#resolveHasListeners = () => { resolve(true); });

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

  get hasListeners(): Promise<true> {
    return this.#hasListenersPromise;
  }

  addEventListener<K extends keyof MediaQueryListEventMap>(
    type: K,
    listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => void
  ): void {
    this.#changeListeners = [...this.#changeListeners, listener];
    this.#resolveHasListeners();
  }

  removeEventListener<K extends keyof MediaQueryListEventMap>(
    type: K,
    listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => void
  ): void {
    this.#changeListeners.filter((candidate) => candidate !== listener);
  }
}

let isDarkQuery = new MockMediaQuery();

Cypress.on("window:before:load", window => {
  isDarkQuery = new MockMediaQuery();
  cy.stub(window, "matchMedia").withArgs("(prefers-color-scheme: dark)").returns(isDarkQuery);
});

const setPrefersColorScheme = (colorScheme: "light" | "dark"): void => {
  cy.log("setPrefersColorScheme", colorScheme);
  cy.then(() => {
    isDarkQuery.matches = colorScheme === "dark";
  });
};

const waitForMediaListeners = (): void => {
  cy.log("waitForMediaListeners");
  cy.then(() => isDarkQuery.hasListeners);
};

context("Theme", (): void => {
  beforeEach(() => {
    cy.visit("/");
    waitForMediaListeners();
  });

  it("defaults to the dark theme.", (): void => {
    getThemeRoot().should("have.class", "dark");
  });

  it("changes to the light theme and back when the user toggles the OS theme.", (): void => {
    getThemeRoot().should("have.class", "dark");
    setPrefersColorScheme("light");
    getThemeRoot().should("have.class", "light");
    setPrefersColorScheme("dark");
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
    getThemeRoot().should("have.class", "dark");
    getThemeSwitch().click();
    getThemeRoot().should("have.class", "light");
    setPrefersColorScheme("light");
    getThemeRoot().should("have.class", "light");
    setPrefersColorScheme("dark");
    getThemeRoot().should("have.class", "dark");
  });
});
