'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pure2 = require('recompose/pure');

var _pure3 = _interopRequireDefault(_pure2);

var _getContext2 = require('recompose/getContext');

var _getContext3 = _interopRequireDefault(_getContext2);

var _withStateHandlers2 = require('recompose/withStateHandlers');

var _withStateHandlers3 = _interopRequireDefault(_withStateHandlers2);

var _withContext2 = require('recompose/withContext');

var _withContext3 = _interopRequireDefault(_withContext2);

var _withHandlers2 = require('recompose/withHandlers');

var _withHandlers3 = _interopRequireDefault(_withHandlers2);

var _setPropTypes2 = require('recompose/setPropTypes');

var _setPropTypes3 = _interopRequireDefault(_setPropTypes2);

var _lifecycle2 = require('recompose/lifecycle');

var _lifecycle3 = _interopRequireDefault(_lifecycle2);

var _mapProps2 = require('recompose/mapProps');

var _mapProps3 = _interopRequireDefault(_mapProps2);

var _compose2 = require('recompose/compose');

var _compose3 = _interopRequireDefault(_compose2);

var _noop2 = require('lodash/noop');

var _noop3 = _interopRequireDefault(_noop2);

var _indexOf2 = require('lodash/indexOf');

var _indexOf3 = _interopRequireDefault(_indexOf2);

var _uniqueId2 = require('lodash/uniqueId');

var _uniqueId3 = _interopRequireDefault(_uniqueId2);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _reactDom = require('react-dom');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _spatialNavigation = require('./spatialNavigation');

var _spatialNavigation2 = _interopRequireDefault(_spatialNavigation);

var _withSpatialNavigationContext = require('./withSpatialNavigationContext');

var _measureLayout = require('./measureLayout');

var _measureLayout2 = _interopRequireDefault(_measureLayout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; } /* eslint-disable react/no-find-dom-node */


var withFocusable = function withFocusable() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$propagateFocus = _ref.propagateFocus,
      configPropagateFocus = _ref$propagateFocus === undefined ? false : _ref$propagateFocus;

  return function (BaseComponent) {
    return (0, _compose3.default)(_withSpatialNavigationContext.getSpatialNavigationContext, (0, _getContext3.default)({
      /**
       * From the context provided by another higher-level 'withFocusable' component
       */
      parentFocusKey: _propTypes2.default.string
    }), (0, _withStateHandlers3.default)(function (_ref2) {
      var focusKey = _ref2.focusKey,
          _ref2$setFocus = _ref2.setFocus,
          setFocus = _ref2$setFocus === undefined ? _noop3.default : _ref2$setFocus;

      var realFocusKey = focusKey || (0, _uniqueId3.default)('sn:focusable-item-');

      return {
        realFocusKey: realFocusKey,
        setFocus: setFocus.bind(null, realFocusKey)
      };
    }, {}), (0, _mapProps3.default)(function (_ref3) {
      var currentFocusKey = _ref3.currentFocusKey,
          parentsHavingFocusedChild = _ref3.parentsHavingFocusedChild,
          realFocusKey = _ref3.realFocusKey,
          props = _objectWithoutProperties(_ref3, ['currentFocusKey', 'parentsHavingFocusedChild', 'realFocusKey']);

      return _extends({}, props, {
        realFocusKey: realFocusKey,
        focused: currentFocusKey === realFocusKey,
        hasFocusedChild: (0, _indexOf3.default)(parentsHavingFocusedChild, realFocusKey) > -1
      });
    }),

    /**
     * Propagate it's own 'focusKey' as a 'parentFocusKey' to it's children
     */
    (0, _withContext3.default)({
      parentFocusKey: _propTypes2.default.string
    }, function (_ref4) {
      var realFocusKey = _ref4.realFocusKey;
      return {
        parentFocusKey: realFocusKey
      };
    }), (0, _withHandlers3.default)({
      onEnterPressHandler: function onEnterPressHandler(_ref5) {
        var _ref5$onEnterPress = _ref5.onEnterPress,
            onEnterPress = _ref5$onEnterPress === undefined ? _noop3.default : _ref5$onEnterPress;
        return onEnterPress;
      },
      onBecameFocusedHandler: function onBecameFocusedHandler(_ref6) {
        var _ref6$onBecameFocused = _ref6.onBecameFocused,
            onBecameFocused = _ref6$onBecameFocused === undefined ? _noop3.default : _ref6$onBecameFocused;
        return onBecameFocused;
      }
    }), (0, _lifecycle3.default)({
      updateLayout: function updateLayout() {
        var focusKey = this.props.realFocusKey;


        var node = (0, _reactDom.findDOMNode)(this);

        (0, _measureLayout2.default)(node, function (x, y, width, height, left, top) {
          _spatialNavigation2.default.updateLayout(focusKey, {
            x: x,
            y: y,
            width: width,
            height: height,
            left: left,
            top: top
          });
        });
      },
      componentDidMount: function componentDidMount() {
        var _props = this.props,
            focusKey = _props.realFocusKey,
            propagateFocus = _props.propagateFocus,
            parentFocusKey = _props.parentFocusKey,
            onEnterPressHandler = _props.onEnterPressHandler,
            onBecameFocusedHandler = _props.onBecameFocusedHandler;


        _spatialNavigation2.default.addFocusable({
          focusKey: focusKey,
          parentFocusKey: parentFocusKey,
          onEnterPressHandler: onEnterPressHandler,
          onBecameFocusedHandler: onBecameFocusedHandler,
          propagateFocus: !!(configPropagateFocus || propagateFocus)
        });

        this.updateLayout();
      },
      componentDidUpdate: function componentDidUpdate(prevProps) {
        var _props2 = this.props,
            focused = _props2.focused,
            focusKey = _props2.realFocusKey,
            onBecameFocusedHandler = _props2.onBecameFocusedHandler;


        if (!prevProps.focused && focused) {
          onBecameFocusedHandler(_spatialNavigation2.default.getNodeLayoutByFocusKey(focusKey));
        }

        this.updateLayout();
      },
      componentWillUnmount: function componentWillUnmount() {
        var focusKey = this.props.realFocusKey;


        _spatialNavigation2.default.removeFocusable({
          focusKey: focusKey
        });
      }
    }), _pure3.default, (0, _setPropTypes3.default)({
      focusKey: _propTypes2.default.string,
      propagateFocus: _propTypes2.default.bool,
      onEnterPress: _propTypes2.default.func,
      onBecameFocused: _propTypes2.default.func
    }))(BaseComponent);
  };
};

exports.default = withFocusable;