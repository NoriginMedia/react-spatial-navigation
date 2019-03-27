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
import measureLayout from './measureLayout';

const omitProps = (keys) => mapProps((props) => omit(props, keys));

const withFocusable = ({
  propagateFocus: configPropagateFocus = false,
  forgetLastFocusedChild: configForgetLastFocusedChild = false,
  trackChildren = false
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
      setFocus: SpatialNavigation.setFocus.bind(null, realFocusKey),
      focused: false,
      hasFocusedChild: false,
      parentFocusKey: parentFocusKey || ROOT_FOCUS_KEY
    };
  }, {
    onUpdateFocus: () => (focused = false) => ({
      focused
    }),
    onUpdateHasFocusedChild: (oldState) => (hasFocusedChild = false) => ({
      hasFocusedChild: trackChildren ? hasFocusedChild : oldState.hasFocusedChild
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
      onEnterPress = noop
    }) => onEnterPress,
    onBecameFocusedHandler: ({
      onBecameFocused = noop
    }) => onBecameFocused,
    pauseSpatialNavigation: () => SpatialNavigation.pause,
    resumeSpatialNavigation: () => SpatialNavigation.resume
  }),

  lifecycle({
    updateLayout() {
      const {realFocusKey: focusKey} = this.props;

      const node = findDOMNode(this);

      measureLayout(node, (x, y, width, height, left, top) => {
        SpatialNavigation.updateLayout(focusKey, {
          x,
          y,
          width,
          height,
          left,
          top
        });
      });
    },

    componentDidMount() {
      const {
        realFocusKey: focusKey,
        propagateFocus = false,
        parentFocusKey,
        forgetLastFocusedChild = false,
        onEnterPressHandler,
        onBecameFocusedHandler,
        onUpdateFocus,
        onUpdateHasFocusedChild
      } = this.props;

      SpatialNavigation.addFocusable({
        focusKey,
        parentFocusKey,
        onEnterPressHandler,
        onBecameFocusedHandler,
        onUpdateFocus,
        onUpdateHasFocusedChild,
        propagateFocus: (configPropagateFocus || propagateFocus),
        forgetLastFocusedChild: (configForgetLastFocusedChild || forgetLastFocusedChild)
      });

      this.updateLayout();
    },
    componentDidUpdate(prevProps) {
      const {focused, realFocusKey: focusKey, onBecameFocusedHandler} = this.props;

      if (!prevProps.focused && focused) {
        onBecameFocusedHandler(SpatialNavigation.getNodeLayoutByFocusKey(focusKey));
      }

      // this.updateLayout();
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
    'onUpdateFocus',
    'onUpdateHasFocusedChild'
  ])
);

export default withFocusable;
