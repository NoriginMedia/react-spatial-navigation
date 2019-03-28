'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactDom = require('react-dom');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _uniqueId = require('lodash/uniqueId');

var _uniqueId2 = _interopRequireDefault(_uniqueId);

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

var _omit = require('lodash/omit');

var _omit2 = _interopRequireDefault(_omit);

var _compose = require('recompose/compose');

var _compose2 = _interopRequireDefault(_compose);

var _lifecycle = require('recompose/lifecycle');

var _lifecycle2 = _interopRequireDefault(_lifecycle);

var _withHandlers = require('recompose/withHandlers');

var _withHandlers2 = _interopRequireDefault(_withHandlers);

var _withContext = require('recompose/withContext');

var _withContext2 = _interopRequireDefault(_withContext);

var _withStateHandlers = require('recompose/withStateHandlers');

var _withStateHandlers2 = _interopRequireDefault(_withStateHandlers);

var _getContext = require('recompose/getContext');

var _getContext2 = _interopRequireDefault(_getContext);

var _pure = require('recompose/pure');

var _pure2 = _interopRequireDefault(_pure);

var _mapProps = require('recompose/mapProps');

var _mapProps2 = _interopRequireDefault(_mapProps);

var _spatialNavigation = require('./spatialNavigation');

var _spatialNavigation2 = _interopRequireDefault(_spatialNavigation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; } /* eslint-disable react/no-find-dom-node */


var omitProps = function omitProps(keys) {
  return (0, _mapProps2.default)(function (props) {
    return (0, _omit2.default)(props, keys);
  });
};

var withFocusable = function withFocusable() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$propagateFocus = _ref.propagateFocus,
      configPropagateFocus = _ref$propagateFocus === undefined ? false : _ref$propagateFocus,
      _ref$forgetLastFocuse = _ref.forgetLastFocusedChild,
      configForgetLastFocusedChild = _ref$forgetLastFocuse === undefined ? false : _ref$forgetLastFocuse,
      _ref$trackChildren = _ref.trackChildren,
      configTrackChildren = _ref$trackChildren === undefined ? false : _ref$trackChildren;

  return (0, _compose2.default)((0, _getContext2.default)({
    /**
     * From the context provided by another higher-level 'withFocusable' component
     */
    parentFocusKey: _propTypes2.default.string
  }), (0, _withStateHandlers2.default)(function (_ref2) {
    var focusKey = _ref2.focusKey,
        parentFocusKey = _ref2.parentFocusKey;

    var realFocusKey = focusKey || (0, _uniqueId2.default)('sn:focusable-item-');

    return {
      realFocusKey: realFocusKey,
      setFocus: _spatialNavigation2.default.setFocus.bind(null, realFocusKey),
      focused: false,
      hasFocusedChild: false,
      parentFocusKey: parentFocusKey || _spatialNavigation.ROOT_FOCUS_KEY
    };
  }, {
    onUpdateFocus: function onUpdateFocus() {
      return function () {
        var focused = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        return {
          focused: focused
        };
      };
    },
    onUpdateHasFocusedChild: function onUpdateHasFocusedChild(oldState, props) {
      return function () {
        var hasFocusedChild = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        return {
          hasFocusedChild: configTrackChildren || props.trackChildren ? hasFocusedChild : oldState.hasFocusedChild
        };
      };
    }
  }),

  /**
   * Propagate own 'focusKey' as a 'parentFocusKey' to it's children
   */
  (0, _withContext2.default)({
    parentFocusKey: _propTypes2.default.string
  }, function (_ref3) {
    var realFocusKey = _ref3.realFocusKey;
    return {
      parentFocusKey: realFocusKey
    };
  }), (0, _withHandlers2.default)({
    onEnterPressHandler: function onEnterPressHandler(_ref4) {
      var _ref4$onEnterPress = _ref4.onEnterPress,
          onEnterPress = _ref4$onEnterPress === undefined ? _noop2.default : _ref4$onEnterPress,
          rest = _objectWithoutProperties(_ref4, ['onEnterPress']);

      return function () {
        onEnterPress(rest);
      };
    },
    onBecameFocusedHandler: function onBecameFocusedHandler(_ref5) {
      var _ref5$onBecameFocused = _ref5.onBecameFocused,
          onBecameFocused = _ref5$onBecameFocused === undefined ? _noop2.default : _ref5$onBecameFocused,
          rest = _objectWithoutProperties(_ref5, ['onBecameFocused']);

      return function (layout) {
        onBecameFocused(layout, rest);
      };
    },
    pauseSpatialNavigation: function pauseSpatialNavigation() {
      return _spatialNavigation2.default.pause;
    },
    resumeSpatialNavigation: function resumeSpatialNavigation() {
      return _spatialNavigation2.default.resume;
    }
  }), (0, _lifecycle2.default)({
    componentDidMount: function componentDidMount() {
      var _props = this.props,
          focusKey = _props.realFocusKey,
          _props$propagateFocus = _props.propagateFocus,
          propagateFocus = _props$propagateFocus === undefined ? false : _props$propagateFocus,
          parentFocusKey = _props.parentFocusKey,
          _props$forgetLastFocu = _props.forgetLastFocusedChild,
          forgetLastFocusedChild = _props$forgetLastFocu === undefined ? false : _props$forgetLastFocu,
          onEnterPressHandler = _props.onEnterPressHandler,
          onBecameFocusedHandler = _props.onBecameFocusedHandler,
          onUpdateFocus = _props.onUpdateFocus,
          onUpdateHasFocusedChild = _props.onUpdateHasFocusedChild;


      var node = (0, _reactDom.findDOMNode)(this);

      _spatialNavigation2.default.addFocusable({
        focusKey: focusKey,
        node: node,
        parentFocusKey: parentFocusKey,
        onEnterPressHandler: onEnterPressHandler,
        onBecameFocusedHandler: onBecameFocusedHandler,
        onUpdateFocus: onUpdateFocus,
        onUpdateHasFocusedChild: onUpdateHasFocusedChild,
        propagateFocus: configPropagateFocus || propagateFocus,
        forgetLastFocusedChild: configForgetLastFocusedChild || forgetLastFocusedChild
      });
    },
    componentDidUpdate: function componentDidUpdate(prevProps) {
      var _props2 = this.props,
          focused = _props2.focused,
          focusKey = _props2.realFocusKey,
          onBecameFocusedHandler = _props2.onBecameFocusedHandler;


      if (!prevProps.focused && focused) {
        onBecameFocusedHandler(_spatialNavigation2.default.getNodeLayoutByFocusKey(focusKey));
      }
    },
    componentWillUnmount: function componentWillUnmount() {
      var focusKey = this.props.realFocusKey;


      _spatialNavigation2.default.removeFocusable({
        focusKey: focusKey
      });
    }
  }), _pure2.default, omitProps(['onBecameFocusedHandler', 'onEnterPressHandler', 'onUpdateFocus', 'onUpdateHasFocusedChild', 'propagateFocus', 'forgetLastFocusedChild', 'trackChildren']));
};

exports.default = withFocusable;