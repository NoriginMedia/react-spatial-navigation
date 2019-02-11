/* eslint-disable react/no-find-dom-node */
import {findDOMNode} from 'react-dom';
import PropTypes from 'prop-types';
import uniqueId from 'lodash/uniqueId';
import indexOf from 'lodash/indexOf';
import noop from 'lodash/noop';
import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';
import lifecycle from 'recompose/lifecycle';
import setPropTypes from 'recompose/setPropTypes';
import withHandlers from 'recompose/withHandlers';
import withContext from 'recompose/withContext';
import withStateHandlers from 'recompose/withStateHandlers';
import getContext from 'recompose/getContext';
import pure from 'recompose/pure';
import SpatialNavigation from './spatialNavigation';
import {getSpatialNavigationContext} from './withSpatialNavigationContext';
import measureLayout from './measureLayout';

const withFocusable = ({propagateFocus: configPropagateFocus = false} = {}) => compose(
  getSpatialNavigationContext,
  getContext({
    /**
     * From the context provided by another higher-level 'withFocusable' component
     */
    parentFocusKey: PropTypes.string
  }),
  withStateHandlers(({focusKey, setFocus = noop}) => {
    const realFocusKey = focusKey || uniqueId('sn:focusable-item-');

    return {
      realFocusKey,
      setFocus: setFocus.bind(null, realFocusKey)
    };
  }, {}),
  mapProps(({
    currentFocusKey,
    parentsHavingFocusedChild,
    realFocusKey,
    ...props
  }) => ({
    ...props,
    realFocusKey,
    focused: currentFocusKey === realFocusKey,
    hasFocusedChild: indexOf(parentsHavingFocusedChild, realFocusKey) > -1
  })),

  /**
   * Propagate it's own 'focusKey' as a 'parentFocusKey' to it's children
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
    }) => onBecameFocused
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
      const {realFocusKey: focusKey, propagateFocus, parentFocusKey,
        onEnterPressHandler, onBecameFocusedHandler} = this.props;

      SpatialNavigation.addFocusable({
        focusKey,
        parentFocusKey,
        onEnterPressHandler,
        onBecameFocusedHandler,
        propagateFocus: !!(configPropagateFocus || propagateFocus)
      });

      this.updateLayout();
    },
    componentDidUpdate(prevProps) {
      const {focused, realFocusKey: focusKey, onBecameFocusedHandler} = this.props;

      if (!prevProps.focused && focused) {
        onBecameFocusedHandler(SpatialNavigation.getNodeLayoutByFocusKey(focusKey));
      }

      this.updateLayout();
    },
    componentWillUnmount() {
      const {realFocusKey: focusKey} = this.props;

      SpatialNavigation.removeFocusable({
        focusKey
      });
    }
  }),
  pure,
  setPropTypes({
    focusKey: PropTypes.string,
    propagateFocus: PropTypes.bool,
    onEnterPress: PropTypes.func,
    onBecameFocused: PropTypes.func
  })
);

export default withFocusable;
