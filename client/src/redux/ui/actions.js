import actionTypePrefixer from "../utilities/action-type-prefixer";

const prefixActionType = actionTypePrefixer("ui");

export const actionTypes = {
  setIsEditing: prefixActionType("SET_IS_EDITING"),
  setImageDetailsVisible: prefixActionType("SET_IMAGE_DETAILS_VISIBLE"),
  setSelectedImageId: prefixActionType("SET_SELECTED_IMAGE_ID")
};

export const setIsEditing = (isEditing) => ({
  type: actionTypes.setIsEditing,
  isEditing
});

export const setImageDetailsVisible = (imageDetailsVisible) => ({
  type: actionTypes.setImageDetailsVisible,
  imageDetailsVisible
});

export const setSelectedImageId = (selectedImageId) => ({
  type: actionTypes.setSelectedImageId,
  selectedImageId
});