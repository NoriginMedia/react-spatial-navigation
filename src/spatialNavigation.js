import filter from 'lodash/filter';
import first from 'lodash/first';
import sortBy from 'lodash/sortBy';
import findKey from 'lodash/findKey';

export const ROOT_FOCUS_KEY = 'SN:ROOT';

const DIRECTION_LEFT = 'left';
const DIRECTION_RIGHT = 'right';
const DIRECTION_UP = 'up';
const DIRECTION_DOWN = 'down';
const KEY_ENTER = 'enter';

const DEFAULT_KEY_MAP = {
  [DIRECTION_LEFT]: 37,
  [DIRECTION_UP]: 38,
  [DIRECTION_RIGHT]: 39,
  [DIRECTION_DOWN]: 40,
  [KEY_ENTER]: 13
};

class SpatialNavigation {
  /**
   * Returns the reference point to be used for directional calculations.
   * @param direction - Direction which the key press has indicated
   * @param sibling - whether or not this is a sibling (aka a potential item to move to)
   * @param item - The layout of the object in question in order to perform calculations
   */
  static getReferencePoints(direction, sibling, item) {
    const itemX = item.left;
    const itemY = item.top;
    const itemWidth = item.width;
    const itemHeight = item.height;

    const result = {
      resultX: itemX + (itemWidth / 2),
      resultY: itemY + (itemHeight / 2)
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

  constructor() {
    this.focusKey = null;
    this.setFocus = null;
    this.focusableComponents = {};
    this.tvEventListener = null;
    this.keyMap = DEFAULT_KEY_MAP;

    this.onKeyEvent = this.onKeyEvent.bind(this);
  }

  init(setFocus) {
    this.setFocus = setFocus;

    this.bindEventHandlers();
  }

  destroy() {
    this.focusKey = null;
    this.setFocus = null;

    this.unbindEventHandlers();
  }

  bindEventHandlers() {
    if (window) {
      this.tvEventListener = (event) => {
        const eventType = findKey(this.getKeyMap(), (code) => event.keyCode === code);

        if (!eventType) {
          return;
        }

        if (eventType === KEY_ENTER && this.focusKey) {
          event.preventDefault();
          event.stopPropagation();

          this.onEnterPress();
        } else {
          event.preventDefault();
          event.stopPropagation();

          this.onKeyEvent(event.keyCode);
        }
      };

      window.addEventListener('keydown', this.tvEventListener);
    }
  }

  unbindEventHandlers() {
    if (window) {
      window.removeEventListener('keydown', this.tvEventListener);
      this.tvEventListener = null;
    }
  }

  onEnterPress() {
    const component = this.focusableComponents[this.focusKey];

    component.onEnterPressHandler && component.onEnterPressHandler();
  }

  onKeyEvent(keyCode) {
    const direction = findKey(this.getKeyMap(), (code) => keyCode === code);

    this.smartNavigate(direction);
  }

  /**
   * This function navigates between siblings OR goes up by the Tree
   * Based on the Direction
   */
  smartNavigate(direction, fromParentFocusKey) {
    const currentComponent = this.focusableComponents[fromParentFocusKey || this.focusKey];

    if (currentComponent) {
      const {parentFocusKey, focusKey, layout} = currentComponent;

      const isVerticalDirection = direction === DIRECTION_DOWN || direction === DIRECTION_UP;
      const isIncrementalDirection = direction === DIRECTION_DOWN || direction === DIRECTION_RIGHT;

      const coordinate = isVerticalDirection ? 'top' : 'left';

      /**
       * Get only the siblings with the coords on the way of our moving direction
       */
      const siblings = filter(this.focusableComponents, (component) => component.parentFocusKey === parentFocusKey &&
        ((isIncrementalDirection && component.layout[coordinate] > layout[coordinate]) ||
          (!isIncrementalDirection && component.layout[coordinate] < layout[coordinate])));

      const currentReferencePoints = SpatialNavigation.getReferencePoints(direction, false, layout);
      const currentReferenceX = currentReferencePoints.resultX;
      const currentReferenceY = currentReferencePoints.resultY;

      const sortedSiblings = sortBy(siblings, (sibling) => {
        const siblingReferencePoints = SpatialNavigation.getReferencePoints(direction, true, sibling.layout);
        const siblingReferenceX = siblingReferencePoints.resultX;
        const siblingReferenceY = siblingReferencePoints.resultY;

        return Math.sqrt(Math.pow((siblingReferenceX - currentReferenceX), 2) +
          Math.pow((siblingReferenceY - currentReferenceY), 2));
      });

      const nextComponent = first(sortedSiblings);

      if (nextComponent) {
        this.setFocus && this.setFocus(nextComponent.focusKey);
      } else {
        const parentComponent = this.focusableComponents[parentFocusKey];

        parentComponent && (parentComponent.lastFocusedChildKey = focusKey);

        this.smartNavigate(direction, parentFocusKey);
      }
    }
  }

  /**
   * This function navigates to the target node OR goes down by the Tree if node has "propagateFocus"
   * Based on "targetFocusKey"
   */
  getNextFocusKey(targetFocusKey) {
    const targetComponent = this.focusableComponents[targetFocusKey];

    /**
     * Security check, if component doesn't exist, stay on the same focusKey
     */
    if (!targetFocusKey) {
      return targetFocusKey;
    }

    const children = filter(this.focusableComponents, (component) => component.parentFocusKey === targetFocusKey);

    if (children.length > 0) {
      /**
       * First of all trying to focus last focused child
       */
      const {lastFocusedChildKey} = targetComponent;

      if (lastFocusedChildKey && !targetComponent.forgetLastFocusedChild &&
        this.isFocusableComponent(lastFocusedChildKey)) {
        this.onIntermediateNodeBecameFocused(targetFocusKey);

        return this.getNextFocusKey(lastFocusedChildKey);
      }

      /**
       * If there is no lastFocusedChild, trying to focus something by coordinates
       */
      const sortedXChildren = sortBy(children, (child) => child.layout.left);
      const sortedYChildren = sortBy(sortedXChildren, (child) => child.layout.top);
      const {focusKey: childKey} = first(sortedYChildren);

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

  addFocusable({focusKey, parentFocusKey, onEnterPressHandler, onBecameFocusedHandler, forgetLastFocusedChild,
    propagateFocus}) {
    this.focusableComponents[focusKey] = {
      focusKey,
      parentFocusKey,
      onEnterPressHandler,
      onBecameFocusedHandler,
      propagateFocus,
      forgetLastFocusedChild,
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

  removeFocusable({focusKey}) {
    const componentToRemove = this.focusableComponents[focusKey];

    if (componentToRemove) {
      const {parentFocusKey} = componentToRemove;

      Reflect.deleteProperty(this.focusableComponents, focusKey);

      const parentComponent = this.focusableComponents[parentFocusKey];
      const isFocused = focusKey === this.focusKey;

      /**
       * If the component was stored as lastFocusedChild, clear lastFocusedChildKey from parent
       */
      parentComponent && parentComponent.lastFocusedChildKey === focusKey &&
        (parentComponent.lastFocusedChildKey = null);

      /**
       * If the component was also focused at this time, focus another one
       */
      if (isFocused) {
        this.setFocus && this.setFocus(parentFocusKey);
      }
    }
  }

  updateLayout(focusKey, layout) {
    if (this.isFocusableComponent(focusKey)) {
      this.focusableComponents[focusKey].layout = layout;
    }
  }

  getNodeLayoutByFocusKey(focusKey) {
    const component = this.focusableComponents[focusKey];

    if (component) {
      return component.layout;
    }

    return null;
  }

  getCurrentFocusedKey() {
    return this.focusKey;
  }

  setCurrentFocusedKey(focusKey) {
    this.focusKey = focusKey;
  }

  getAllParentsFocusKeys(focusKey) {
    const parents = [];

    let currentComponent = this.focusableComponents[focusKey];

    /**
     * Recursively iterate the tree up and find all the parents' focus keys
     */
    while (currentComponent) {
      const {parentFocusKey} = currentComponent;

      const parentComponent = this.focusableComponents[parentFocusKey];

      if (parentComponent) {
        const {focusKey: currentParentFocusKey} = parentComponent;

        parents.push(currentParentFocusKey);
      }

      currentComponent = parentComponent;
    }

    return parents;
  }

  getKeyMap() {
    return this.keyMap;
  }

  setKeyMap(keyMap) {
    this.keyMap = {
      ...this.getKeyMap(),
      ...keyMap
    };
  }

  isPropagateFocus(focusKey) {
    return this.isFocusableComponent(focusKey) && this.focusableComponents[focusKey].propagateFocus;
  }

  isFocusableComponent(focusKey) {
    return !!this.focusableComponents[focusKey];
  }

  onIntermediateNodeBecameFocused(focusKey) {
    this.isFocusableComponent(focusKey) &&
      this.focusableComponents[focusKey].onBecameFocusedHandler(this.getNodeLayoutByFocusKey(focusKey));
  }
}

/**
 * Export singleton
 */
export default new SpatialNavigation();
