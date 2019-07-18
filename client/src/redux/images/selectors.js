const getLocalState = (state) =>  state.images || [];

export const getAllUrls = (state) => Object.values(getLocalState(state)).map((image) => image.url);

export const getImage = (state, id) => getLocalState(state)[id] || null;