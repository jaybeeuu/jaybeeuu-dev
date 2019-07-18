const address = "http://localhost:3000";

const navigate = () => {
  cy.clearLocalStorage("state");
  cy.visit(address,  {
    onBeforeLoad: (win) => {
      win.sessionStorage.clear();
    }
  });
};

const classBuilder = (name) => (local, hash) => `.${name}__${local}--${hash}`;

const imageClass = classBuilder("image");
const carouselClass = classBuilder("carousel");
const imageFormClass = classBuilder("image-form");

export default {
  address,
  navigate,
  carousel: {
    image: {
      selector: imageClass("image", "b3MOD"),
      title: imageClass("title", "29O_N"),
      editButton: imageClass("edit-button", "1jiZE"),
      description: imageClass("description", "Os0bh"),
    },
    nextButton: carouselClass("nav-button-right", "3lX-i")
  },
  imageForm: {
    title: `${imageFormClass("field", "31Frz")}[name="image-title"]`
  },
};

