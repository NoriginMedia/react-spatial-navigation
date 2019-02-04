/* eslint-disable react/no-find-dom-node */
import {findDOMNode} from 'react-dom';
import PropTypes from 'prop-types';
import {uniqueId, indexOf, noop} from 'lodash';
import {
  compose,
  mapProps,
  lifecycle,
  setPropTypes,
  withHandlers,
  withContext,
  withStateHandlers,
  getContext,
  pure
} from 'recompose';
import SpatialNavigation from './spatialNavigation';
import {getSpatialNavigationContext} from './withSpatialNavigationContext';
import measureLayout from './measureLayout';

const withFocusable = ({propagateFocus: configPropagateFocus = false} = {}) => (BaseComponent) => compose(
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
)(BaseComponent);

export default withFocusable;
