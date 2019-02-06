import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import lifecycle from 'recompose/lifecycle';
import withContext from 'recompose/withContext';
import withStateHandlers from 'recompose/withStateHandlers';
import pure from 'recompose/pure';
import SpatialNavigation, {ROOT_FOCUS_KEY} from './spatialNavigation';
import {withSpatialNavigationContext} from './withSpatialNavigationContext';

const withSpatialNavigation = ({keyMap} = {}) => (BaseComponent) => {
  if (keyMap) {
    SpatialNavigation.setKeyMap(keyMap);
  }

  return compose(
    withStateHandlers({
      currentFocusKey: SpatialNavigation.getCurrentFocusedKey(),

      /**
       * This collection contains focus keys of the elements that are having a child focused
       * Might be handy for styling of certain parent components if their child is focused.
       */
      parentsHavingFocusedChild: []
    }, {
      setFocus: ({currentFocusKey, parentsHavingFocusedChild}) => (focusKey, overwriteFocusKey) => {
        // if there exists an overriding focusKey then use it, but only if it exists in the SP service.
        const targetFocusKey = overwriteFocusKey && SpatialNavigation.isFocusableComponent(overwriteFocusKey) ?
          overwriteFocusKey : focusKey;

        if (currentFocusKey !== targetFocusKey) {
          const newFocusKey = SpatialNavigation.getNextFocusKey(targetFocusKey);

          SpatialNavigation.setCurrentFocusedKey(newFocusKey);

          const newParentsHavingFocusedChild = SpatialNavigation.getAllParentsFocusKeys(newFocusKey);

          return {
            currentFocusKey: newFocusKey,
            parentsHavingFocusedChild: newParentsHavingFocusedChild
          };
        }

        return {
          currentFocusKey,
          parentsHavingFocusedChild
        };
      }
    }),

    /**
     * Propagate these props to children as a context
     */
    withSpatialNavigationContext,

    /**
     * Propagate parentFocusKey as ROOT
     */
    withContext({
      parentFocusKey: PropTypes.string
    }, () => ({
      parentFocusKey: ROOT_FOCUS_KEY
    })),
    lifecycle({
      componentDidMount() {
        SpatialNavigation.init(this.props.setFocus);
      },
      componentWillUnmount() {
        SpatialNavigation.destroy();
      }
    }),
    pure
  )(BaseComponent);
};

export default withSpatialNavigation;
