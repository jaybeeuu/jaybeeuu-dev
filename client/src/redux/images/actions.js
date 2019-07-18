import actionTypePrefixer from "../utilities/action-type-prefixer";
const prefixActionType = actionTypePrefixer("image");

export const actionTypes = {
  setTitle: prefixActionType("SET_TITLE"),
  setDescription: prefixActionType("SET_DESCRIPTION"),
  setTags: prefixActionType("SET_TAGS")
};

export const setTitle = (imageId, title) => ({
  type: actionTypes.setTitle,
  imageId,
  title
});

export const setDescription = (imageId, description) => ({
  type: actionTypes.setDescription,
  imageId,
  description
});

export const setTags = (imageId, tags) => ({
  type: actionTypes.setTags,
  imageId,
  tags
});
