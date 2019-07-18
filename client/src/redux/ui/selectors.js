const getLocalState = (state) =>  state.ui || {};

export const getIsEditing = (state) => getLocalState(state).isEditing;
export const getImageDetailsVisible = (state) => getLocalState(state).imageDetailsVisible;
export const getSelectedImageId = (state) => getLocalState(state).selectedImageId;