import classNames from "classnames";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { CSSTransition } from "react-transition-group";
import * as fromImages from "../../../redux/images/selectors";
import { setIsEditing, setImageDetailsVisible } from "../../../redux/ui/actions";
import IconButton, { icons } from "../../common/icon-button/icon-button";
import * as fromUi from "../../../redux/ui/selectors";

import styles from "./image.scss";
import styleConstants from "../../styles/_constants.scss";

// eslint-disable-next-line
console.log(styleConstants);

class Image extends Component {
  static propTypes = {
    className: PropTypes.string,
    description: PropTypes.string,
    imageDetailsVisible: PropTypes.bool.isRequired,
    isEditing: PropTypes.bool.isRequired,
    setImageDetailsVisible: PropTypes.func.isRequired,
    setIsEditing: PropTypes.func.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    title: PropTypes.string,
    url: PropTypes.string.isRequired
  };

  toggleImageDetailsVisible = () => {
    this.props.setImageDetailsVisible(!this.props.imageDetailsVisible);
  };

  toggleIsEditing = () => {
    this.props.setIsEditing(!this.props.isEditing);
  };

  render() {
    const {
      className,
      imageDetailsVisible,
      url,
      title,
      description,
      tags
    } = this.props;

    return (
      <div
        className={classNames(styles.root, className)}
      >
        <img
          className={styles.image}
          src={url}
          alt={title}
          onClick={this.toggleImageDetailsVisible}
        />
        <CSSTransition
          in={imageDetailsVisible}
          timeout={parseInt(styleConstants.complexDuration)}
          classNames={{
            enter: styles.detailsContainerEnter,
            enterActive: styles.detailsContainerEnterActive,
            enterDone: styles.detailsContainerEnterDone,
            exit: styles.detailsContainerExit,
            exitActive: styles.detailsContainerExitActive,
            exitDone: styles.detailsContainerExitDone
          }}
          unmountOnExit
        >
          <div className={styles.detailsContainer}>
            <div className={styles.title}>
              <h1>{title}</h1>
              <IconButton
                className={styles.editButton}
                icon={icons.EDIT}
                onClick={this.toggleIsEditing}
              />
            </div>
            <div className={styles.details}>
              <p className={styles.description}>{description}</p>
              <ul className={styles.tags}>
                {tags.map((tag, index) => (
                  <li className={styles.tag} key={index}>{tag}</li>
                ))}
              </ul>
            </div>
          </div>
        </CSSTransition>
      </div>
    );
  }
}

const mapStateToProps = (state, { imageId }) => ({
  ...fromImages.getImage(state, imageId),
  isEditing: fromUi.getIsEditing(state),
  imageDetailsVisible: fromUi.getImageDetailsVisible(state)
});

const mapDispatchToProps = ({
  setImageDetailsVisible,
  setIsEditing
});

export default connect(mapStateToProps, mapDispatchToProps)(Image);