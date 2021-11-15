declare module "preact-transitioning" {
  import type { ComponentType, ComponentChildren, JSX } from "preact";

  type TransitionPhase
    = "appear"
    | "appearActive"
    | "appearDone"
    | "enter"
    | "enterActive"
    | "enterDone"
    | "exit"
    | "exitActive"
    | "exitDone";

  type BaseTransitionState<CurrentPhase extends TransitionPhase> = {
    [InactivePhase in Exclude<TransitionPhase, CurrentPhase>]: false;
  } & {
    [ActivePhase in CurrentPhase]: true;
  };

  type TransitionState
    = BaseTransitionState<"appear">
    | BaseTransitionState<"appearActive">
    | BaseTransitionState<"appearDone">
    | BaseTransitionState<"enter">
    | BaseTransitionState<"enterActive">
    | BaseTransitionState<"enterDone">
    | BaseTransitionState<"exit">
    | BaseTransitionState<"exitActive">
    | BaseTransitionState<"exitDone">;

  interface TransitionProps {
    children: (transitionState: TransitionState) => JSX.Element
    in?: Boolean;
    appear?: Boolean;
    enter?: Boolean;
    exit?: Boolean;
    alwaysMounted?: Boolean;
    duration?: number;
    onEnter?: () => void;
    onEntering?: () => void;
    onEntered?: () => void;
    onExit?: () => void;
    onExiting?: () => void;
    onExited?: () => void;
  }

  type Transition = ComponentType<TransitionProps>;
  declare const Transition: Transition;

  interface CSSTransitionProps extends TransitionProps {
    children: ComponentChildren;
    classNames: string | {
      appear?: string;
      appearActive?: string;
      appearDone?: string;
      enter?: string;
      enterActive?: string;
      enterDone?: string;
      exit?: string;
      exitActive?: string;
      exitDone?: string;
    }
  }

  type CSSTransition = ComponentType<CSSTransitionProps>;
  declare const CSSTransition: CSSTransition;

  interface StyleTransitionProps extends TransitionProps {
    styles: {
      appear?: JSX.CSSProperties;
      appearActive?: JSX.CSSProperties;
      appearDone?: JSX.CSSProperties;
      enter?: JSX.CSSProperties;
      enterActive?: JSX.CSSProperties;
      enterDone?: JSX.CSSProperties;
      exit?: JSX.CSSProperties;
      exitActive?: JSX.CSSProperties;
      exitDone?: JSX.CSSProperties;
    }
  }

  type StyleTransition = ComponentType<StyleTransitionProps>;
  declare const StyleTransition: StyleTransition;

  interface TransitionGroupProps {
    children: ComponentChildren
    appear?: boolean;
    enter?: boolean;
    exit?: boolean;
    duration?: number;
  }

  type TransitionGroup = ComponentType<TransitionGroupProps>;
  declare const TransitionGroup: TransitionGroup;
}
