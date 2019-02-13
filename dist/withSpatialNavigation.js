'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _compose = require('recompose/compose');

var _compose2 = _interopRequireDefault(_compose);

var _lifecycle = require('recompose/lifecycle');

var _lifecycle2 = _interopRequireDefault(_lifecycle);

var _withContext = require('recompose/withContext');

var _withContext2 = _interopRequireDefault(_withContext);

var _withStateHandlers = require('recompose/withStateHandlers');

var _withStateHandlers2 = _interopRequireDefault(_withStateHandlers);

var _withHandlers = require('recompose/withHandlers');

var _withHandlers2 = _interopRequireDefault(_withHandlers);

var _pure = require('recompose/pure');

var _pure2 = _interopRequireDefault(_pure);

var _spatialNavigation = require('./spatialNavigation');

var _spatialNavigation2 = _interopRequireDefault(_spatialNavigation);

var _withSpatialNavigationContext = require('./withSpatialNavigationContext');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var withSpatialNavigation = function withSpatialNavigation() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      keyMap = _ref.keyMap;

  if (keyMap) {
    _spatialNavigation2.default.setKeyMap(keyMap);
  }

  return (0, _compose2.default)((0, _withStateHandlers2.default)({
    currentFocusKey: _spatialNavigation2.default.getCurrentFocusedKey(),

    /**
     * This collection contains focus keys of the elements that are having a child focused
     * Might be handy for styling of certain parent components if their child is focused.
     */
    parentsHavingFocusedChild: []
  }, {
    setFocus: function setFocus(_ref2) {
      var currentFocusKey = _ref2.currentFocusKey,
          parentsHavingFocusedChild = _ref2.parentsHavingFocusedChild;
      return function (focusKey, overwriteFocusKey) {
        // if there exists an overriding focusKey then use it, but only if it exists in the SP service.
        var targetFocusKey = overwriteFocusKey && _spatialNavigation2.default.isFocusableComponent(overwriteFocusKey) ? overwriteFocusKey : focusKey;

        if (currentFocusKey !== targetFocusKey) {
          var newFocusKey = _spatialNavigation2.default.getNextFocusKey(targetFocusKey);

          _spatialNavigation2.default.setCurrentFocusedKey(newFocusKey);

          var newParentsHavingFocusedChild = _spatialNavigation2.default.getAllParentsFocusKeys(newFocusKey);

          return {
            currentFocusKey: newFocusKey,
            parentsHavingFocusedChild: newParentsHavingFocusedChild
          };
        }

        return {
          currentFocusKey: currentFocusKey,
          parentsHavingFocusedChild: parentsHavingFocusedChild
        };
      };
    }
  }), (0, _withHandlers2.default)({
    pauseSpatialNavigation: function pauseSpatialNavigation() {
      return _spatialNavigation2.default.pause;
    },
    resumeSpatialNavigation: function resumeSpatialNavigation() {
      return _spatialNavigation2.default.resume;
    }
  }),

  /**
   * Propagate these props to children as a context
   */
  _withSpatialNavigationContext.withSpatialNavigationContext,

  /**
   * Propagate parentFocusKey as ROOT
   */
  (0, _withContext2.default)({
    parentFocusKey: _propTypes2.default.string
  }, function () {
    return {
      parentFocusKey: _spatialNavigation.ROOT_FOCUS_KEY
    };
  }), (0, _lifecycle2.default)({
    componentDidMount: function componentDidMount() {
      _spatialNavigation2.default.init(this.props.setFocus);
    },
    componentWillUnmount: function componentWillUnmount() {
      _spatialNavigation2.default.destroy();
    }
  }), _pure2.default);
};

exports.default = withSpatialNavigation;