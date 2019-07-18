import PropTypes from "prop-types";
import classNames from "classnames";
import React, { Component } from "react";
import { connect } from "react-redux";
import preload from "../../api/preload";
import * as fromImages from "../../redux/images/selectors";
import { setSelectedImageId } from "../../redux/ui/actions";
import * as fromUi from "../../redux/ui/selectors";
import IconButton, { icons } from "../common/icon-button/icon-button";
import Image from "./image/image";

import styles from "./carousel.scss";

class Carousel extends Component {
  static propTypes = {
    className: PropTypes.string,
    imageUrls: PropTypes.arrayOf(PropTypes.string).isRequired,
    setSelectedImageId: PropTypes.func.isRequired,
    selectedImageId: PropTypes.number.isRequired
  };

  componentDidMount() {
    preload(...this.props.imageUrls);
  }

  selectNextImage() {
    const { setSelectedImageId, selectedImageId } = this.props;
    setSelectedImageId(selectedImageId + 1);
  }

  selectPreviousImage() {
    const { setSelectedImageId, selectedImageId } = this.props;
    setSelectedImageId(selectedImageId - 1);
  }

  render() {
    const {
      className,
      imageUrls,
      selectedImageId
    } = this.props;

    const isFirstImage = !selectedImageId;
    const isLastImage = selectedImageId === imageUrls.length - 1;

    return (
      <div className={classNames(styles.root, className)} >
        { !isFirstImage ? (
          <IconButton
            className={styles.navButtonLeft}
            onClick={this.selectPreviousImage.bind(this)}
            icon={icons.CHEVRON_LEFT}
          />
        ) : null }
        <Image className={styles.image} imageId={selectedImageId} />
        { !isLastImage ? (
          <IconButton
            className={styles.navButtonRight}
            onClick={this.selectNextImage.bind(this)}
            icon={icons.CHEVRON_RIGHT}
          />
        ) : null }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  imageUrls: fromImages.getAllUrls(state),
  selectedImageId: fromUi.getSelectedImageId(state),
});

const mapDispatchToProps = {
  setSelectedImageId
};

export default connect(mapStateToProps, mapDispatchToProps)(Carousel);