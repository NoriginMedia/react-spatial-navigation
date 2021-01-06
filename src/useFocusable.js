import React, {useMemo, useState, useEffect, useRef, useContext, createContext} from 'react';
import noop from 'lodash/noop';

import SpatialNavigation, {ROOT_FOCUS_KEY} from './spatialNavigation';

export const FocusContext = createContext();
const useFocusContext = () => useContext(FocusContext);

export function RootProvider({
  children
}) {
  const parent = useRef(ROOT_FOCUS_KEY);
  const nextParent = (focusKey) => {
    parent.current = focusKey;
  };

  return (
    <FocusContext.Provider value={{parent, nextParent}}>
      {children}
    </FocusContext.Provider>
  );
}

const useFocusable = ({
  forgetLastFocusedChild,
  autoRestoreFocus,
  blockNavigationOut,
  preferredChildFocusKey,
  focusKey,
  trackChildren,
  isParent = false,
  focusable = true,
  onEnterPressHandler = noop,
  onArrowPressHandler = noop,
  onBecameFocusedHandler = noop,
  onBecameBlurredHandler = noop
}) => {
  const nodeRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const [hasFocusedChild, setHasFocusedChild] = useState(false);
  const {parent, nextParent} = useFocusContext();
  const parentFocusKey = useRef(parent.current).current;

  useMemo(() => {
    isParent && nextParent(focusKey);
  }, [isParent, focusKey, nextParent]);

  useEffect(() => {
    const node = nodeRef.current;

    SpatialNavigation.addFocusable({
      focusKey,
      node,
      parentFocusKey,
      preferredChildFocusKey,
      onEnterPressHandler,
      onArrowPressHandler,
      onBecameFocusedHandler,
      onBecameBlurredHandler,
      onUpdateFocus: (isFocused = false) => setFocused(isFocused),
      onUpdateHasFocusedChild: (isFocused = false) => setHasFocusedChild(isFocused),
      forgetLastFocusedChild,
      trackChildren,
      blockNavigationOut,
      autoRestoreFocus,
      focusable
    });

    return () => {
      SpatialNavigation.removeFocusable({
        focusKey
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const node = nodeRef.current;

    SpatialNavigation.updateFocusable(focusKey, {
      node,
      preferredChildFocusKey,
      focusable,
      blockNavigationOut
    });
  }, [
    focusKey,
    preferredChildFocusKey,
    focusable,
    blockNavigationOut
  ]);

  const register = (element) => (nodeRef.current = element);

  const setFocus = () => SpatialNavigation.setFocus(focusKey);

  const navigateByDirection = SpatialNavigation.navigateByDirection;
  const pauseSpatialNavigation = SpatialNavigation.pause;
  const resumeSpatialNavigation = SpatialNavigation.resume;

  return {
    register,
    setFocus,
    focused,
    hasFocusedChild,
    navigateByDirection,
    stealFocus: setFocus,
    pauseSpatialNavigation,
    resumeSpatialNavigation
  };
};

export default useFocusable;
