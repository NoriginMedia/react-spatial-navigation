/* eslint-disable react/no-find-dom-node */
import {findDOMNode} from 'react-dom';
import PropTypes from 'prop-types';
import uniqueId from 'lodash/uniqueId';
import noop from 'lodash/noop';
import omit from 'lodash/omit';
import compose from 'recompose/compose';
import lifecycle from 'recompose/lifecycle';
import withHandlers from 'recompose/withHandlers';
import withContext from 'recompose/withContext';
import withStateHandlers from 'recompose/withStateHandlers';
import getContext from 'recompose/getContext';
import pure from 'recompose/pure';
import mapProps from 'recompose/mapProps';
import SpatialNavigation, {ROOT_FOCUS_KEY} from './spatialNavigation';

const omitProps = (keys) => mapProps((props) => omit(props, keys));

const withFocusable = ({
  forgetLastFocusedChild: configForgetLastFocusedChild = false,
  trackChildren: configTrackChildren = false
} = {}) => compose(
  getContext({
    /**
     * From the context provided by another higher-level 'withFocusable' component
     */
    parentFocusKey: PropTypes.string
  }),

  withStateHandlers(({focusKey, parentFocusKey}) => {
    const realFocusKey = focusKey || uniqueId('sn:focusable-item-');

    return {
      realFocusKey,

      /**
       * This method is used to imperatively set focus to a component.
       * It is blocked in the Native mode because the native engine decides what to focus by itself.
       */
      setFocus: SpatialNavigation.isNativeMode() ? noop : SpatialNavigation.setFocus.bind(null, realFocusKey),

      navigateByDirection: SpatialNavigation.navigateByDirection,

      /**
       * In Native mode this is the only way to mark component as focused.
       * This method always steals focus onto current component no matter which arguments are passed in.
       */
      stealFocus: SpatialNavigation.setFocus.bind(null, realFocusKey, realFocusKey),
      focused: false,
      hasFocusedChild: false,
      parentFocusKey: parentFocusKey || ROOT_FOCUS_KEY
    };
  }, {
    onUpdateFocus: () => (focused = false) => ({
      focused
    }),
    onUpdateHasFocusedChild: () => (hasFocusedChild = false) => ({
      hasFocusedChild
    })
  }),

  /**
   * Propagate own 'focusKey' as a 'parentFocusKey' to it's children
   */
  withContext({
    parentFocusKey: PropTypes.string
  }, ({realFocusKey}) => ({
    parentFocusKey: realFocusKey
  })),

  withHandlers({
    onEnterPressHandler: ({
      onEnterPress = noop,
      ...rest
    }) => () => {
      onEnterPress(rest);
    },
    onArrowPressHandler: ({
      onArrowPress = noop,
      ...rest
    }) => (...args) => onArrowPress(...args, rest),
    onBecameFocusedHandler: ({
      onBecameFocused = noop,
      ...rest
    }) => (layout) => {
      onBecameFocused(layout, rest);
    },
    pauseSpatialNavigation: () => SpatialNavigation.pause,
    resumeSpatialNavigation: () => SpatialNavigation.resume
  }),

  lifecycle({
    componentDidMount() {
      const {
        realFocusKey: focusKey,
        parentFocusKey,
        preferredChildFocusKey,
        forgetLastFocusedChild = false,
        onEnterPressHandler,
        onArrowPressHandler,
        onBecameFocusedHandler,
        onUpdateFocus,
        onUpdateHasFocusedChild,
        trackChildren,
        focusable = true
      } = this.props;

      const node = SpatialNavigation.isNativeMode() ? this : findDOMNode(this);

      SpatialNavigation.addFocusable({
        focusKey,
        node,
        parentFocusKey,
        preferredChildFocusKey,
        onEnterPressHandler,
        onArrowPressHandler,
        onBecameFocusedHandler,
        onUpdateFocus,
        onUpdateHasFocusedChild,
        forgetLastFocusedChild: (configForgetLastFocusedChild || forgetLastFocusedChild),
        trackChildren: (configTrackChildren || trackChildren),
        focusable
      });
    },
    componentDidUpdate(prevProps) {
      const {
        focused, realFocusKey: focusKey, onBecameFocusedHandler, preferredChildFocusKey, focusable = true
      } = this.props;

      const node = SpatialNavigation.isNativeMode() ? this : findDOMNode(this);

      SpatialNavigation.updateFocusable(focusKey, {
        node,
        preferredChildFocusKey,
        focusable
      });

      if (!prevProps.focused && focused) {
        onBecameFocusedHandler(SpatialNavigation.getNodeLayoutByFocusKey(focusKey));
      }
    },
    componentWillUnmount() {
      const {realFocusKey: focusKey} = this.props;

      SpatialNavigation.removeFocusable({
        focusKey
      });
    }
  }),

  pure,

  omitProps([
    'onBecameFocusedHandler',
    'onEnterPressHandler',
    'onArrowPressHandler',
    'onUpdateFocus',
    'onUpdateHasFocusedChild',
    'forgetLastFocusedChild',
    'trackChildren'
  ])
);

export default withFocusable;
