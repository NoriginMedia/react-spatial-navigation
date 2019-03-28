"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var ELEMENT_NODE = 1;

var getRect = function getRect(node) {
  var offsetParent = node.offsetParent;

  var height = node.offsetHeight;
  var width = node.offsetWidth;
  var left = node.offsetLeft;
  var top = node.offsetTop;

  while (offsetParent && offsetParent.nodeType === ELEMENT_NODE) {
    left += offsetParent.offsetLeft - offsetParent.scrollLeft;
    top += offsetParent.offsetTop - offsetParent.scrollTop;
    var _offsetParent = offsetParent;
    offsetParent = _offsetParent.offsetParent;
  }

  return {
    height: height,
    left: left,
    top: top,
    width: width
  };
};

var measureLayout = function measureLayout(node, callback) {
  var relativeNode = node && node.parentNode;

  if (node && relativeNode) {
    setTimeout(function () {
      var relativeRect = getRect(relativeNode);

      var _getRect = getRect(node),
          height = _getRect.height,
          left = _getRect.left,
          top = _getRect.top,
          width = _getRect.width;

      var x = left - relativeRect.left;
      var y = top - relativeRect.top;

      callback(x, y, width, height, left, top);
    }, 0);
  }
};

exports.default = measureLayout;