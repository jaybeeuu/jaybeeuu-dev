import React from "react";
import Carousel from "./carousel/carousel";
import ImageFormPanel from "./image-form-panel/image-form-panel" ;

import styles from "./app.scss";

const App = () => (
  <div className={styles.root}>
    <Carousel className={styles.carouselPanel}/>
    <ImageFormPanel />
  </div>
);

export default App;