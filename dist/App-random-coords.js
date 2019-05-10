'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _random = require('lodash/random');

var _random2 = _interopRequireDefault(_random);

var _uniqueId = require('lodash/uniqueId');

var _uniqueId2 = _interopRequireDefault(_uniqueId);

var _reactNative = require('react-native');

var _withFocusable = require('./withFocusable');

var _withFocusable2 = _interopRequireDefault(_withFocusable);

var _spatialNavigation = require('./spatialNavigation');

var _spatialNavigation2 = _interopRequireDefault(_spatialNavigation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint-disable react/no-multi-comp */


var VIEW_HEIGHT = 720;
var VIEW_WIDTH = 1280;

var colors = ['#337fdd', '#dd4558', '#7ddd6a', '#dddd4d', '#8299dd', '#edab83', '#60ed9e', '#d15fb6', '#c0ee33'];

var squares = [];

for (var i = 0; i < 20; i++) {
  var boxHeight = (0, _random2.default)(50, 200);
  var boxWidth = (0, _random2.default)(50, 200);

  squares.push({
    id: (0, _uniqueId2.default)(),
    width: boxWidth,
    height: boxHeight,
    top: (0, _random2.default)(0, VIEW_HEIGHT - boxHeight - 20),
    left: (0, _random2.default)(0, VIEW_WIDTH - boxWidth - 20),
    backgroundColor: colors[(0, _random2.default)(0, colors.length - 1)]
  });
}

_spatialNavigation2.default.init({
  debug: true,
  visualDebug: true
});

// SpatialNavigation.setKeyMap(keyMap); -> Custom key map

var styles = _reactNative.StyleSheet.create({
  wrapper: {
    height: VIEW_HEIGHT,
    width: VIEW_WIDTH,
    backgroundColor: '#333333'
  },
  box: {
    position: 'absolute'
  },
  boxFocused: {
    borderWidth: 5,
    borderColor: '#e3ff3a',
    backgroundColor: 'white',
    zIndex: 999
  }
});

var Box = function Box(_ref) {
  var top = _ref.top,
      left = _ref.left,
      width = _ref.width,
      height = _ref.height,
      backgroundColor = _ref.backgroundColor,
      focused = _ref.focused;

  var style = {
    top: top,
    left: left,
    width: width,
    height: height,
    backgroundColor: backgroundColor
  };

  return _react2.default.createElement(_reactNative.View, { style: [styles.box, style, focused ? styles.boxFocused : null] });
};

Box.propTypes = {
  top: _propTypes2.default.number.isRequired,
  left: _propTypes2.default.number.isRequired,
  width: _propTypes2.default.number.isRequired,
  height: _propTypes2.default.number.isRequired,
  backgroundColor: _propTypes2.default.string.isRequired,
  focused: _propTypes2.default.bool.isRequired
};

var BoxFocusable = (0, _withFocusable2.default)()(Box);

var Spatial = function (_React$PureComponent) {
  _inherits(Spatial, _React$PureComponent);

  function Spatial() {
    _classCallCheck(this, Spatial);

    return _possibleConstructorReturn(this, (Spatial.__proto__ || Object.getPrototypeOf(Spatial)).apply(this, arguments));
  }

  _createClass(Spatial, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.props.setFocus();
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _reactNative.View,
        { style: styles.wrapper },
        squares.map(function (_ref2) {
          var id = _ref2.id,
              rest = _objectWithoutProperties(_ref2, ['id']);

          return _react2.default.createElement(BoxFocusable, _extends({
            key: id
          }, rest));
        })
      );
    }
  }]);

  return Spatial;
}(_react2.default.PureComponent);

Spatial.propTypes = {
  setFocus: _propTypes2.default.func.isRequired
};

var SpatialFocusable = (0, _withFocusable2.default)()(Spatial);

var App = function App() {
  return _react2.default.createElement(
    _reactNative.View,
    null,
    _react2.default.createElement(SpatialFocusable, null)
  );
};

exports.default = App;