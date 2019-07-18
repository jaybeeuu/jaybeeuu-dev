const actionTypePrefixer = (prefix) => (actionType) => `${prefix}/${actionType}`;

export default actionTypePrefixer;