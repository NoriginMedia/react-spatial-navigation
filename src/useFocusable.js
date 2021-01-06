import {useState, useEffect, useRef} from 'react';
import noop from 'lodash/noop';

import SpatialNavigation, {ROOT_FOCUS_KEY} from './spatialNavigation';

const useFocusable = ({
  forgetLastFocusedChild,
  autoRestoreFocus,
  blockNavigationOut,
  preferredChildFocusKey,
  focusKey,
  parentFocusKey,
  trackChildren,
  focusable = true,
  onEnterPressHandler = noop,
  onArrowPressHandler = noop,
  onBecameFocusedHandler = noop,
  onBecameBlurredHandler = noop
}) => {
  const nodeRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const [hasFocusedChild, setHasFocusedChild] = useState(false);

  useEffect(() => {
    const node = nodeRef.current;

    SpatialNavigation.addFocusable({
      focusKey,
      node,
      parentFocusKey: parentFocusKey || ROOT_FOCUS_KEY,
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
