import reducer from "./reducer";
import * as actions from "./actions";
import * as selectors from "./selectors";

const localStateAsGlobal = (localState = {}) => ({
  ui: localState
});

describe("ui", () => {
  describe("reducer", () => {
    it("has the expected default value of is editing", () => {
      const defaultGlobalState = localStateAsGlobal(reducer());

      expect(selectors.getIsEditing(defaultGlobalState)).toEqual(false);
    });

    it("has the expected default value of selectedImageId", () => {
      const defaultGlobalState = localStateAsGlobal(reducer());

      expect(selectors.getSelectedImageId(defaultGlobalState)).toEqual(0);
    });

    it("has the expected default value of imageDetailsVisible", () => {
      const defaultGlobalState = localStateAsGlobal(reducer());

      expect(selectors.getImageDetailsVisible(defaultGlobalState)).toEqual(false);
    });
  });

  describe("actions", () => {
    describe("setIsEditting", () => {
      it("updates the correct part of the store.", () => {
        const finalState = reducer({ isEditing: false }, actions.setIsEditing(true));

        expect(selectors.getIsEditing(localStateAsGlobal(finalState))).toBe(true);
      });
    });

    describe("setSelectedImageId", () => {
      it("updates the correct part of the store.", () => {
        const finalState = reducer({ selectedImageId: 0 }, actions.setSelectedImageId(1));

        expect(selectors.getSelectedImageId(localStateAsGlobal(finalState))).toBe(1);
      });
    });

    describe("setImageDetailsVisible", () => {
      it("updates the correct part of the store.", () => {
        const finalState = reducer({ imageDetailsVisible: false }, actions.setImageDetailsVisible(true));

        expect(selectors.getImageDetailsVisible(localStateAsGlobal(finalState))).toBe(true);
      });
    });
  });
});