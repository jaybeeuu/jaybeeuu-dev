context("POC", (): void => {
  it("loads", (): void => {
    cy.visit("/");
    cy.get("#app div").should("have.text", "Hello, Client World!");
  });
});
