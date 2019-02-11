'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ROOT_FOCUS_KEY = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _DEFAULT_KEY_MAP;

var _filter = require('lodash/filter');

var _filter2 = _interopRequireDefault(_filter);

var _first2 = require('lodash/first');

var _first3 = _interopRequireDefault(_first2);

var _sortBy = require('lodash/sortBy');

var _sortBy2 = _interopRequireDefault(_sortBy);

var _findKey = require('lodash/findKey');

var _findKey2 = _interopRequireDefault(_findKey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ROOT_FOCUS_KEY = exports.ROOT_FOCUS_KEY = 'SN:ROOT';

var DIRECTION_LEFT = 'left';
var DIRECTION_RIGHT = 'right';
var DIRECTION_UP = 'up';
var DIRECTION_DOWN = 'down';
var KEY_ENTER = 'enter';

var DEFAULT_KEY_MAP = (_DEFAULT_KEY_MAP = {}, _defineProperty(_DEFAULT_KEY_MAP, DIRECTION_LEFT, 37), _defineProperty(_DEFAULT_KEY_MAP, DIRECTION_UP, 38), _defineProperty(_DEFAULT_KEY_MAP, DIRECTION_RIGHT, 39), _defineProperty(_DEFAULT_KEY_MAP, DIRECTION_DOWN, 40), _defineProperty(_DEFAULT_KEY_MAP, KEY_ENTER, 13), _DEFAULT_KEY_MAP);

var SpatialNavigation = function () {
  _createClass(SpatialNavigation, null, [{
    key: 'getReferencePoints',

    /**
     * Returns the reference point to be used for directional calculations.
     * @param direction - Direction which the key press has indicated
     * @param sibling - whether or not this is a sibling (aka a potential item to move to)
     * @param item - The layout of the object in question in order to perform calculations
     */
    value: function getReferencePoints(direction, sibling, item) {
      var itemX = item.left;
      var itemY = item.top;
      var itemWidth = item.width;
      var itemHeight = item.height;

      var result = {
        resultX: itemX + itemWidth / 2,
        resultY: itemY + itemHeight / 2
      };

      switch (direction) {
        case DIRECTION_RIGHT:
          result.resultX = sibling ? itemX : itemX + itemWidth;
          break;
        case DIRECTION_LEFT:
          result.resultX = sibling ? itemX + itemWidth : itemX;
          break;
        case DIRECTION_UP:
          result.resultY = sibling ? itemY + itemHeight : itemY;
          break;
        case DIRECTION_DOWN:
          result.resultY = sibling ? itemY : itemY + itemHeight;
          break;
        default:
          break;
      }

      return result;
    }
  }]);

  function SpatialNavigation() {
    _classCallCheck(this, SpatialNavigation);

    this.focusKey = null;
    this.setFocus = null;
    this.focusableComponents = {};
    this.tvEventListener = null;
    this.keyMap = DEFAULT_KEY_MAP;

    this.onKeyEvent = this.onKeyEvent.bind(this);
  }

  _createClass(SpatialNavigation, [{
    key: 'init',
    value: function init(setFocus) {
      this.setFocus = setFocus;

      this.bindEventHandlers();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.focusKey = null;
      this.setFocus = null;

      this.unbindEventHandlers();
    }
  }, {
    key: 'bindEventHandlers',
    value: function bindEventHandlers() {
      var _this = this;

      if (window) {
        this.tvEventListener = function (event) {
          var eventType = (0, _findKey2.default)(_this.getKeyMap(), function (code) {
            return event.keyCode === code;
          });

          if (!eventType) {
            return;
          }

          if (eventType === KEY_ENTER && _this.focusKey) {
            event.preventDefault();
            event.stopPropagation();

            _this.onEnterPress();
          } else {
            event.preventDefault();
            event.stopPropagation();

            _this.onKeyEvent(event.keyCode);
          }
        };

        window.addEventListener('keydown', this.tvEventListener);
      }
    }
  }, {
    key: 'unbindEventHandlers',
    value: function unbindEventHandlers() {
      if (window) {
        window.removeEventListener('keydown', this.tvEventListener);
        this.tvEventListener = null;
      }
    }
  }, {
    key: 'onEnterPress',
    value: function onEnterPress() {
      var component = this.focusableComponents[this.focusKey];

      component.onEnterPressHandler && component.onEnterPressHandler();
    }
  }, {
    key: 'onKeyEvent',
    value: function onKeyEvent(keyCode) {
      var direction = (0, _findKey2.default)(this.getKeyMap(), function (code) {
        return keyCode === code;
      });

      this.smartNavigate(direction);
    }

    /**
     * This function navigates between siblings OR goes up by the Tree
     * Based on the Direction
     */

  }, {
    key: 'smartNavigate',
    value: function smartNavigate(direction, fromParentFocusKey) {
      var currentComponent = this.focusableComponents[fromParentFocusKey || this.focusKey];

      if (currentComponent) {
        var parentFocusKey = currentComponent.parentFocusKey,
            focusKey = currentComponent.focusKey,
            layout = currentComponent.layout;


        var isVerticalDirection = direction === DIRECTION_DOWN || direction === DIRECTION_UP;
        var isIncrementalDirection = direction === DIRECTION_DOWN || direction === DIRECTION_RIGHT;

        var coordinate = isVerticalDirection ? 'top' : 'left';

        /**
         * Get only the siblings with the coords on the way of our moving direction
         */
        var siblings = (0, _filter2.default)(this.focusableComponents, function (component) {
          return component.parentFocusKey === parentFocusKey && (isIncrementalDirection && component.layout[coordinate] > layout[coordinate] || !isIncrementalDirection && component.layout[coordinate] < layout[coordinate]);
        });

        var currentReferencePoints = SpatialNavigation.getReferencePoints(direction, false, layout);
        var currentReferenceX = currentReferencePoints.resultX;
        var currentReferenceY = currentReferencePoints.resultY;

        var sortedSiblings = (0, _sortBy2.default)(siblings, function (sibling) {
          var siblingReferencePoints = SpatialNavigation.getReferencePoints(direction, true, sibling.layout);
          var siblingReferenceX = siblingReferencePoints.resultX;
          var siblingReferenceY = siblingReferencePoints.resultY;

          return Math.sqrt(Math.pow(siblingReferenceX - currentReferenceX, 2) + Math.pow(siblingReferenceY - currentReferenceY, 2));
        });

        var nextComponent = (0, _first3.default)(sortedSiblings);

        if (nextComponent) {
          this.setFocus && this.setFocus(nextComponent.focusKey);
        } else {
          var parentComponent = this.focusableComponents[parentFocusKey];

          parentComponent && (parentComponent.lastFocusedChildKey = focusKey);

          this.smartNavigate(direction, parentFocusKey);
        }
      }
    }

    /**
     * This function navigates to the target node OR goes down by the Tree if node has "propagateFocus"
     * Based on "targetFocusKey"
     */

  }, {
    key: 'getNextFocusKey',
    value: function getNextFocusKey(targetFocusKey) {
      var targetComponent = this.focusableComponents[targetFocusKey];

      /**
       * Security check, if component doesn't exist, stay on the same focusKey
       */
      if (!targetFocusKey) {
        return targetFocusKey;
      }

      var children = (0, _filter2.default)(this.focusableComponents, function (component) {
        return component.parentFocusKey === targetFocusKey;
      });

      if (children.length > 0) {
        /**
         * First of all trying to focus last focused child
         */
        var lastFocusedChildKey = targetComponent.lastFocusedChildKey;


        if (lastFocusedChildKey && !targetComponent.forgetLastFocusedChild && this.isFocusableComponent(lastFocusedChildKey)) {
          this.onIntermediateNodeBecameFocused(targetFocusKey);

          return this.getNextFocusKey(lastFocusedChildKey);
        }

        /**
         * If there is no lastFocusedChild, trying to focus something by coordinates
         */
        var sortedXChildren = (0, _sortBy2.default)(children, function (child) {
          return child.layout.left;
        });
        var sortedYChildren = (0, _sortBy2.default)(sortedXChildren, function (child) {
          return child.layout.top;
        });

        var _first = (0, _first3.default)(sortedYChildren),
            childKey = _first.focusKey;

        /**
         * If the target node is propagating focus, try to target first child
         */


        if (this.isPropagateFocus(targetFocusKey)) {
          this.onIntermediateNodeBecameFocused(targetFocusKey);

          return this.getNextFocusKey(childKey);
        }

        /**
         * Otherwise focus first child
         */
        return childKey;
      }

      /**
       * If no children, just return targetFocusKey back
       */
      return targetFocusKey;
    }
  }, {
    key: 'addFocusable',
    value: function addFocusable(_ref) {
      var focusKey = _ref.focusKey,
          parentFocusKey = _ref.parentFocusKey,
          onEnterPressHandler = _ref.onEnterPressHandler,
          onBecameFocusedHandler = _ref.onBecameFocusedHandler,
          forgetLastFocusedChild = _ref.forgetLastFocusedChild,
          propagateFocus = _ref.propagateFocus;

      this.focusableComponents[focusKey] = {
        focusKey: focusKey,
        parentFocusKey: parentFocusKey,
        onEnterPressHandler: onEnterPressHandler,
        onBecameFocusedHandler: onBecameFocusedHandler,
        propagateFocus: propagateFocus,
        forgetLastFocusedChild: forgetLastFocusedChild,
        lastFocusedChildKey: null,
        layout: {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          left: 0,
          top: 0
        }
      };
    }
  }, {
    key: 'removeFocusable',
    value: function removeFocusable(_ref2) {
      var focusKey = _ref2.focusKey;

      var componentToRemove = this.focusableComponents[focusKey];

      if (componentToRemove) {
        var parentFocusKey = componentToRemove.parentFocusKey;


        Reflect.deleteProperty(this.focusableComponents, focusKey);

        var parentComponent = this.focusableComponents[parentFocusKey];
        var isFocused = focusKey === this.focusKey;

        /**
         * If the component was stored as lastFocusedChild, clear lastFocusedChildKey from parent
         */
        parentComponent && parentComponent.lastFocusedChildKey === focusKey && (parentComponent.lastFocusedChildKey = null);

        /**
         * If the component was also focused at this time, focus another one
         */
        if (isFocused) {
          this.setFocus && this.setFocus(parentFocusKey);
        }
      }
    }
  }, {
    key: 'updateLayout',
    value: function updateLayout(focusKey, layout) {
      if (this.isFocusableComponent(focusKey)) {
        this.focusableComponents[focusKey].layout = layout;
      }
    }
  }, {
    key: 'getNodeLayoutByFocusKey',
    value: function getNodeLayoutByFocusKey(focusKey) {
      var component = this.focusableComponents[focusKey];

      if (component) {
        return component.layout;
      }

      return null;
    }
  }, {
    key: 'getCurrentFocusedKey',
    value: function getCurrentFocusedKey() {
      return this.focusKey;
    }
  }, {
    key: 'setCurrentFocusedKey',
    value: function setCurrentFocusedKey(focusKey) {
      this.focusKey = focusKey;
    }
  }, {
    key: 'getAllParentsFocusKeys',
    value: function getAllParentsFocusKeys(focusKey) {
      var parents = [];

      var currentComponent = this.focusableComponents[focusKey];

      /**
       * Recursively iterate the tree up and find all the parents' focus keys
       */
      while (currentComponent) {
        var _currentComponent = currentComponent,
            parentFocusKey = _currentComponent.parentFocusKey;


        var parentComponent = this.focusableComponents[parentFocusKey];

        if (parentComponent) {
          var currentParentFocusKey = parentComponent.focusKey;


          parents.push(currentParentFocusKey);
        }

        currentComponent = parentComponent;
      }

      return parents;
    }
  }, {
    key: 'getKeyMap',
    value: function getKeyMap() {
      return this.keyMap;
    }
  }, {
    key: 'setKeyMap',
    value: function setKeyMap(keyMap) {
      this.keyMap = _extends({}, this.getKeyMap(), keyMap);
    }
  }, {
    key: 'isPropagateFocus',
    value: function isPropagateFocus(focusKey) {
      return this.isFocusableComponent(focusKey) && this.focusableComponents[focusKey].propagateFocus;
    }
  }, {
    key: 'isFocusableComponent',
    value: function isFocusableComponent(focusKey) {
      return !!this.focusableComponents[focusKey];
    }
  }, {
    key: 'onIntermediateNodeBecameFocused',
    value: function onIntermediateNodeBecameFocused(focusKey) {
      this.isFocusableComponent(focusKey) && this.focusableComponents[focusKey].onBecameFocusedHandler(this.getNodeLayoutByFocusKey(focusKey));
    }
  }]);

  return SpatialNavigation;
}();

/**
 * Export singleton
 */


exports.default = new SpatialNavigation();