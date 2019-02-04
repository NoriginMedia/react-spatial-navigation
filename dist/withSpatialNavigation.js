'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pure2 = require('recompose/pure');

var _pure3 = _interopRequireDefault(_pure2);

var _withContext2 = require('recompose/withContext');

var _withContext3 = _interopRequireDefault(_withContext2);

var _withStateHandlers2 = require('recompose/withStateHandlers');

var _withStateHandlers3 = _interopRequireDefault(_withStateHandlers2);

var _lifecycle2 = require('recompose/lifecycle');

var _lifecycle3 = _interopRequireDefault(_lifecycle2);

var _compose2 = require('recompose/compose');

var _compose3 = _interopRequireDefault(_compose2);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _spatialNavigation = require('./spatialNavigation');

var _spatialNavigation2 = _interopRequireDefault(_spatialNavigation);

var _withSpatialNavigationContext = require('./withSpatialNavigationContext');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var withSpatialNavigation = function withSpatialNavigation() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      keyMap = _ref.keyMap;

  return function (BaseComponent) {
    if (keyMap) {
      _spatialNavigation2.default.setKeyMap(keyMap);
    }

    return (0, _compose3.default)((0, _withStateHandlers3.default)({
      currentFocusKey: _spatialNavigation2.default.getCurrentFocusedKey(),

      /**
       * This collection contains focus keys of the elements that are having a child focused
       * Might be handy for styling of certain parent components if their child is focused
       */
      parentsHavingFocusedChild: []
    }, {
      setFocus: function setFocus(_ref2) {
        var currentFocusKey = _ref2.currentFocusKey,
            parentsHavingFocusedChild = _ref2.parentsHavingFocusedChild;
        return function (focusKey, overwriteFocusKey) {
          var targetFocusKey = overwriteFocusKey || focusKey;

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
    }),

    /**
     * Propagate these props to children as a context
     */
    _withSpatialNavigationContext.withSpatialNavigationContext,

    /**
     * Propagate parentFocusKey as ROOT
     */
    (0, _withContext3.default)({
      parentFocusKey: _propTypes2.default.string
    }, function () {
      return {
        parentFocusKey: _spatialNavigation.ROOT_FOCUS_KEY
      };
    }), (0, _lifecycle3.default)({
      componentDidMount: function componentDidMount() {
        _spatialNavigation2.default.init(this.props.setFocus);
      },
      componentWillUnmount: function componentWillUnmount() {
        _spatialNavigation2.default.destroy();
      }
    }), _pure3.default)(BaseComponent);
  };
};

exports.default = withSpatialNavigation;