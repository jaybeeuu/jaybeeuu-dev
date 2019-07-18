import PropTypes from "prop-types";
import React from "react";
import { CSSTransition } from "react-transition-group";
import { connect } from "react-redux";
import * as fromUi from "../../redux/ui/selectors";
import ImageForm from "./image-form/image-form" ;

import styles from "./image-form-panel.scss";
import styleConstants from "../styles/_constants.scss";

const ImageFormPanel = ({ selectedImageId, isEditing }) => (
  <div>
    <CSSTransition
      in={isEditing}
      timeout={parseInt(styleConstants.complexDuration)}
      classNames={{
        enter: styles.formEnter,
        enterActive: styles.formEnterActive,
        enterDone: styles.formEnterDone,
        exit: styles.formExit,
        exitActive: styles.formExitActive,
        exitDone: styles.formExitDone
      }}
      unmountOnExit
    >
      <ImageForm
        imageId={selectedImageId}
        className={styles.form}
      />
    </CSSTransition>
  </div>
);

ImageFormPanel.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  selectedImageId: PropTypes.number.isRequired
};

const mapStateToProps = (state) => ({
  selectedImageId: fromUi.getSelectedImageId(state),
  isEditing: fromUi.getIsEditing(state)
});

export default connect(mapStateToProps)(ImageFormPanel);