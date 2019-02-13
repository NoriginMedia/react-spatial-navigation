'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSpatialNavigationContext = exports.withSpatialNavigationContext = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _setDisplayName = require('recompose/setDisplayName');

var _setDisplayName2 = _interopRequireDefault(_setDisplayName);

var _wrapDisplayName = require('recompose/wrapDisplayName');

var _wrapDisplayName2 = _interopRequireDefault(_wrapDisplayName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var SpatialNavigationContext = _react2.default.createContext();

var withSpatialNavigationContext = function withSpatialNavigationContext(BaseComponent) {
  var WithSpatialNavigationContext = function WithSpatialNavigationContext(ownerProps) {
    var setFocus = ownerProps.setFocus,
        currentFocusKey = ownerProps.currentFocusKey,
        parentsHavingFocusedChild = ownerProps.parentsHavingFocusedChild,
        pauseSpatialNavigation = ownerProps.pauseSpatialNavigation,
        resumeSpatialNavigation = ownerProps.resumeSpatialNavigation,
        restProps = _objectWithoutProperties(ownerProps, ['setFocus', 'currentFocusKey', 'parentsHavingFocusedChild', 'pauseSpatialNavigation', 'resumeSpatialNavigation']);

    var contextData = {
      setFocus: setFocus,
      currentFocusKey: currentFocusKey,
      parentsHavingFocusedChild: parentsHavingFocusedChild,
      pauseSpatialNavigation: pauseSpatialNavigation,
      resumeSpatialNavigation: resumeSpatialNavigation
    };

    return _react2.default.createElement(
      SpatialNavigationContext.Provider,
      { value: contextData },
      _react2.default.createElement(BaseComponent, _extends({}, contextData, restProps))
    );
  };

  if (process.env.NODE_ENV !== 'production') {
    return (0, _setDisplayName2.default)((0, _wrapDisplayName2.default)(BaseComponent, 'withSpatialNavigationContext'))(WithSpatialNavigationContext);
  }

  return WithSpatialNavigationContext;
};

exports.withSpatialNavigationContext = withSpatialNavigationContext;
var getSpatialNavigationContext = exports.getSpatialNavigationContext = function getSpatialNavigationContext(BaseComponent) {
  var GetSpatialNavigationContext = function GetSpatialNavigationContext(ownerProps) {
    return _react2.default.createElement(
      SpatialNavigationContext.Consumer,
      null,
      function (context) {
        return _react2.default.createElement(BaseComponent, _extends({}, context, ownerProps));
      }
    );
  };

  if (process.env.NODE_ENV !== 'production') {
    return (0, _setDisplayName2.default)((0, _wrapDisplayName2.default)(BaseComponent, 'withSpatialNavigationContext'))(GetSpatialNavigationContext);
  }

  return GetSpatialNavigationContext;
};