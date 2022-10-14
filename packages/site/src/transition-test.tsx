import type { JSX } from "preact";
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { Transition } from "preact-transitioning";

export const TransitionTest = (): JSX.Element => {
  const [state, setState] = useState({
    appear: false,
    enter: false,
    exit: false,
    in: false,
    rendered: false
  });

  return (
    <div style={{ padding: "20px", backgroundColor: "black", color: "white" }} >
      <label>
        <input
          type="checkbox"
          onChange={() => setState((previous) => ({
            ...previous,
            appear: !previous.appear
          }))}
          checked={state.appear}
        />
        appear
      </label>

      <label>
        <input
          type="checkbox"
          onChange={() => setState((previous) => ({
            ...previous,
            enter: !previous.enter
          }))}
          checked={state.enter}
        />
        enter
      </label>

      <label>
        <input
          type="checkbox"
          onChange={() => setState((previous) => ({
            ...previous,
            exit: !previous.exit
          }))}
          checked={state.exit}
        />
        exit
      </label>

      <label>
        <input
          type="checkbox"
          onChange={() => setState((previous) => ({
            ...previous,
            in: !previous.in
          }))}
          checked={state.in}
        />
        in
      </label>

      <label>
        <input
          type="checkbox"
          onChange={() => setState((previous) => ({
            ...previous,
            rendered: !previous.rendered
          }))}
          checked={state.rendered}
        />
        rendered
      </label>

      {state.rendered ? (
        <Transition
          duration={1000}
          enter={state.enter}
          exit={state.exit}
          in={state.in}
          appear={state.appear}
        >
          {
            (tansitionState) => {
              const status = Object.entries(tansitionState)
                .filter(([, active]) => active)
                .map(([name]) => name);

              useEffect(() => console.log(status), [status]);

              return <div>Status: {status}</div>;
            }
          }
        </Transition>
      ) : <div>Not rendered</div>}
    </div>
  );
};
