/* eslint-disable react/no-find-dom-node */
import {createContext, useContext, useState, useEffect, useRef} from 'react';
import {findDOMNode} from 'react-dom';
import noop from 'lodash/noop';
import uniqueId from 'lodash/uniqueId';

import SpatialNavigation, {ROOT_FOCUS_KEY} from './spatialNavigation';

export const FocusContext = createContext(ROOT_FOCUS_KEY);

const useFocusable = (props) => {
  const {
    forgetLastFocusedChild,
    autoRestoreFocus,
    blockNavigationOut,
    preferredChildFocusKey,
    focusKey: maybeFocusKey,
    trackChildren,
    focusable = true,
    onEnterPress = noop,
    onArrowPress = noop,
    onBecameFocused = noop,
    onBecameBlurred = noop
  } = props;

  const nodeRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const [hasFocusedChild, setHasFocusedChild] = useState(false);

  // From the context provided by another higher-level 'withFocusable' component
  const parentFocusKey = useContext(FocusContext);
  const focusKey = maybeFocusKey || uniqueId('sn:focusable-item-');

  useEffect(() => {
    const node = SpatialNavigation.isNativeMode() ?
      nodeRef.current :
      findDOMNode(nodeRef.current);

    SpatialNavigation.addFocusable({
      focusKey,
      node,
      parentFocusKey,
      preferredChildFocusKey,
      onEnterPressHandler: (details) => {
        onEnterPress(props, details);
      },
      onArrowPressHandler: (direction, details) => onArrowPress(direction, props, details),
      onBecameFocusedHandler: (layout, details) => {
        onBecameFocused(layout, props, details);
      },
      onBecameBlurredHandler: (layout, details) => {
        onBecameBlurred(layout, props, details);
      },
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
    const node = SpatialNavigation.isNativeMode() ?
      nodeRef.current :
      findDOMNode(nodeRef.current);

    SpatialNavigation.updateFocusable(focusKey, {
      node,
      preferredChildFocusKey,
      focusable,
      blockNavigationOut
    });
  }, [
    nodeRef,
    focusKey,
    preferredChildFocusKey,
    focusable,
    blockNavigationOut
  ]);

  return {
    realFocusKey: focusKey,

    /**
     * This method is used to imperatively set focus to a component.
     * It is blocked in the Native mode because the native engine decides what to focus by itself.
     */
    setFocus: SpatialNavigation.isNativeMode() ? noop : SpatialNavigation.setFocus.bind(SpatialNavigation, focusKey),
    navigateByDirection: SpatialNavigation.navigateByDirection,

    /**
     * In Native mode this is the only way to mark component as focused.
     * This method always steals focus onto current component no matter which arguments are passed
     * in.
     */
    stealFocus: SpatialNavigation.setFocus.bind(SpatialNavigation, focusKey, focusKey),
    focused,
    hasFocusedChild,
    parentFocusKey,

    pauseSpatialNavigation: SpatialNavigation.pause,
    resumeSpatialNavigation: SpatialNavigation.resume,
    updateAllSpatialLayouts: SpatialNavigation.updateAllLayouts,

    register: nodeRef
  };
};

export default useFocusable;
