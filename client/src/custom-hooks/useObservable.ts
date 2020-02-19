import { Observable } from "rxjs";
import { useState, useEffect } from "react";

export const useObservable = <TValue>(
  observable: Observable<TValue>
): TValue | undefined => {
  const [state, setState] = useState<TValue>();

  useEffect(() => {
    const sub = observable.subscribe(setState);
    return () => sub.unsubscribe();
  }, [observable]);

  return state;
};
