import classNames from "classnames";
import type { JSX } from "preact";
import { h } from "preact";
import { CSSTransition } from "preact-transitioning";
import css from "./background.module.css";
import type { ImageStateEntry } from "./image-preloader";

const QuasiImg = ({
  alt,
  className,
  url
}: {
  alt: string;
  className?: string;
  url: string;
}): JSX.Element => {
  return (
    <div
      className={classNames(css.backgroundImage, className)}
      role="img"
      aria-label={alt}
      style={{ backgroundImage: `url(${url})` }}
    />
  );
};

export interface ImageSwapperProps<
  ImageName extends string
> {
  className?: string;
  current: ImageStateEntry<ImageName> | null;
  previous: ImageStateEntry<ImageName> | null;
}

export const ImageSwapper = <
  ImageName extends string
>({
  className,
  current,
  previous
}: ImageSwapperProps<ImageName>): JSX.Element => (
  <div className={className}>
    {current ? (
      <CSSTransition
        in={current.loaded}
        classNames={{
          appear: css.transparentIn,
          appearActive: css.opaque,
          appearDone: css.opaque,
          enter: css.transparentIn,
          enterActive: css.opaque,
          enterDone: css.opaque
        }}
        appear
        duration={500}
        key={current.url}
      >
        <QuasiImg {...current} />
      </CSSTransition>
    ) : null}
    {previous ? (
      <CSSTransition
        classNames={{
          appearDone: css.opaque,
          enterDone: css.opaque,
          exit: css.opaque,
          exitActive: css.transparentOut
        }}
        exit
        duration={590}
        in={!current?.loaded}
        key={previous.url}
      >
        <QuasiImg {...previous} />
      </CSSTransition>
    ) : null}
  </div>
);
