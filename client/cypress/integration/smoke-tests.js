import page from "../support/page.js";

describe("When the page loads", () => {
  beforeEach(() => {
    page.navigate();
  });

  it("displays the image", () => {
    cy.get(page.carousel.image.selector).should("be.visible");
  });

  it("displays the image title when the image is clicked on.", () => {
    cy.get(page.carousel.image.selector).click();
    cy.get(page.carousel.image.title).contains("English Bay Park").should("be.visible");
  });

  it("displays the image description when the image is clicked on.", () => {
    cy.get(page.carousel.image.selector).click();
    cy.get(page.carousel.image.description).should("be.visible");
  });

  it("displays the next image title when the next button is clicked on.", () => {
    cy.get(page.carousel.nextButton).click();
    cy.get(page.carousel.image.selector).click();
    cy.get(page.carousel.image.title).contains("Nothofagus Gunnii").should("be.visible");
  });

  it("allows the title to be edited in the form once the edit icon has been clicked.", () => {
    cy.get(page.carousel.image.selector).click();
    cy.get(page.carousel.image.editButton).click();
    cy.get(page.imageForm.title).type("This is a new title");
    cy.get(page.carousel.image.title).contains("This is a new title").should("be.visible");
  });
});
