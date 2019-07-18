import { createReducer } from "../utilities/create-reducer";
import { actionTypes } from "./actions";

const defaultState = {
  imageDetailsVisible: false,
  isEditing: false,
  selectedImageId: 0
};

const handlers = {
  [actionTypes.setIsEditing]: (state, { isEditing }) => ({ ... state, isEditing }),
  [actionTypes.setImageDetailsVisible]: (state, { imageDetailsVisible }) => ({ ... state, imageDetailsVisible }),
  [actionTypes.setSelectedImageId]: (state, { selectedImageId }) => ({ ... state, selectedImageId })
};

export default createReducer(defaultState, handlers);