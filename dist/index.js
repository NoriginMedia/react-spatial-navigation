'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setKeyMap = exports.initNavigation = exports.withFocusable = undefined;

var _withFocusable = require('./withFocusable');

var _withFocusable2 = _interopRequireDefault(_withFocusable);

var _spatialNavigation = require('./spatialNavigation');

var _spatialNavigation2 = _interopRequireDefault(_spatialNavigation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var initNavigation = _spatialNavigation2.default.init,
    setKeyMap = _spatialNavigation2.default.setKeyMap;
exports.withFocusable = _withFocusable2.default;
exports.initNavigation = initNavigation;
exports.setKeyMap = setKeyMap;