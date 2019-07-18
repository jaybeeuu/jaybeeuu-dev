import { combineReducers } from "redux";
import images from "./images/reducer";
import ui from "./ui/reducer";

export default combineReducers({
  images,
  ui
});