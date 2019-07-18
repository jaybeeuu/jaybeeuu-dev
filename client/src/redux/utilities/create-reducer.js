export const createReducer = (
  defaultState,
  handlers
) => (
  state = defaultState,
  action = {}
) => handlers.hasOwnProperty(action.type) ? handlers[action.type](state, action) : state;

const createCollectionReducer = (
  defaultCollectionState,
  collectionHandlers,
  defaultRecordState,
  recordHandlers,
  recordIdentifierActionPropName
) => (
  state = defaultCollectionState,
  action = {}
) => {
  const { type, [recordIdentifierActionPropName]: recordId } = action;

  if(recordHandlers.hasOwnProperty(type)) {
    return {
      ...state,
      [recordId]: recordHandlers[type](state[recordId] || defaultRecordState, action)
    };
  } else if (collectionHandlers.hasOwnProperty(type)) {
    return collectionHandlers[type](state, action);
  } else {
    return state;
  }
};

export const createObjectReducer = (
  collectionHandlers,
  defaultRecordState,
  recordHandlers,
  recordIdentifierActionPropName
) => createCollectionReducer(
  {},
  collectionHandlers,
  defaultRecordState,
  recordHandlers,
  recordIdentifierActionPropName
);

export const createArrayReducer = (
  collectionHandlers,
  defaultRecordState,
  recordHandlers,
  recordIdentifierActionPropName
) => createCollectionReducer(
  [],
  collectionHandlers,
  defaultRecordState,
  recordHandlers,
  recordIdentifierActionPropName
);