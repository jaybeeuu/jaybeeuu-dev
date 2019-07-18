import { createArrayReducer } from "../utilities/create-reducer";
import { actionTypes } from "./actions";

const defaultRecordState = {};

const recordHandlers = {
  [actionTypes.setTitle]: (state, { title }) => ({ ...state, title }),
  [actionTypes.setDescription]: (state, { description }) => ({ ...state, description }),
  [actionTypes.setTags]: (state, { tags }) => ({ ...state, tags })
};

const collectionHandlers = {
};

export default createArrayReducer(
  collectionHandlers,
  defaultRecordState,
  recordHandlers,
  "imageId"
);