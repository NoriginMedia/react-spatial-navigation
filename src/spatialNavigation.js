import filter from 'lodash/filter';
import first from 'lodash/first';
import sortBy from 'lodash/sortBy';
import findKey from 'lodash/findKey';
import forEach from 'lodash/forEach';
import forOwn from 'lodash/forOwn';
import difference from 'lodash/difference';
import measureLayout from './measureLayout';
import VisualDebugger from './visualDebugger';

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

const DEBUG_FN_COLORS = ['#0FF', '#FF0', '#F0F'];

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
    /**
     * Storage for all focusable components
     */
    this.focusableComponents = {};

    /**
     * Storing current focused key
     */
    this.focusKey = null;

    /**
     * This collection contains focus keys of the elements that are having a child focused
     * Might be handy for styling of certain parent components if their child is focused.
     */
    this.parentsHavingFocusedChild = [];

    this.enabled = false;

    /**
     * Flag used to block key events from this service
     * @type {boolean}
     */
    this.paused = false;

    this.keyEventListener = null;
    this.keyMap = DEFAULT_KEY_MAP;

    this.onKeyEvent = this.onKeyEvent.bind(this);
    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.setFocus = this.setFocus.bind(this);
    this.init = this.init.bind(this);
    this.setKeyMap = this.setKeyMap.bind(this);

    this.debug = false;
    this.visualDebugger = null;

    this.logIndex = 0;
  }

  init({
    debug: debug = false,
    visualDebug: visualDebug = false
  } = {}) {
    if (!this.enabled) {
      this.enabled = true;
      this.bindEventHandlers();
      this.debug = debug;
      if (visualDebug) {
        this.visualDebugger = new VisualDebugger();
        this.startDrawLayouts();
      }
    }
  }

  startDrawLayouts() {
    const draw = () => {
      requestAnimationFrame(() => {
        this.visualDebugger.clearLayouts();
        forOwn(this.focusableComponents, (component, focusKey) => {
          this.visualDebugger.drawLayout(
            component.layout,
            focusKey,
            component.parentFocusKey
          );
        });
        draw();
      });
    };

    draw();
  }

  destroy() {
    if (this.enabled) {
      this.enabled = false;
      this.focusKey = null;
      this.parentsHavingFocusedChild = [];
      this.focusableComponents = {};
      this.paused = false;
      this.keyMap = DEFAULT_KEY_MAP;

      this.unbindEventHandlers();
    }
  }

  bindEventHandlers() {
    if (window) {
      this.keyEventListener = (event) => {
        if (this.paused === true) {
          return;
        }

        this.logIndex++;

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

      window.addEventListener('keydown', this.keyEventListener);
    }
  }

  unbindEventHandlers() {
    if (window) {
      window.removeEventListener('keydown', this.keyEventListener);
      this.keyEventListener = null;
    }
  }

  onEnterPress() {
    const component = this.focusableComponents[this.focusKey];

    component.onEnterPressHandler && component.onEnterPressHandler();
  }

  onKeyEvent(keyCode) {
    this.visualDebugger && this.visualDebugger.clear();

    const direction = findKey(this.getKeyMap(), (code) => keyCode === code);

    this.smartNavigate(direction);
  }

  /**
   * This function navigates between siblings OR goes up by the Tree
   * Based on the Direction
   */
  smartNavigate(direction, fromParentFocusKey) {
    this.log('smartNavigate', 'direction', direction);
    this.log('smartNavigate', 'fromParentFocusKey', fromParentFocusKey);
    this.log('smartNavigate', 'this.focusKey', this.focusKey);

    const currentComponent = this.focusableComponents[fromParentFocusKey || this.focusKey];

    this.log(
      'smartNavigate', 'currentComponent',
      currentComponent ? currentComponent.focusKey : undefined,
      currentComponent ? currentComponent.node : undefined
    );

    if (currentComponent) {
      const {parentFocusKey, focusKey, layout} = currentComponent;

      const isVerticalDirection = direction === DIRECTION_DOWN || direction === DIRECTION_UP;
      const isIncrementalDirection = direction === DIRECTION_DOWN || direction === DIRECTION_RIGHT;

      const currentReferencePoints = SpatialNavigation.getReferencePoints(direction, false, layout);
      const currentReferenceX = currentReferencePoints.resultX;
      const currentReferenceY = currentReferencePoints.resultY;

      /**
       * Get only the siblings with the coords on the way of our moving direction
       */
      const siblings = filter(this.focusableComponents, (component) => {
        if (component.parentFocusKey === parentFocusKey) {
          const siblingReferencePoints = SpatialNavigation.getReferencePoints(direction, true, component.layout);
          const siblingReferenceX = siblingReferencePoints.resultX;
          const siblingReferenceY = siblingReferencePoints.resultY;

          if (isIncrementalDirection) {
            return isVerticalDirection ?
              siblingReferenceY >= currentReferenceY : siblingReferenceX >= currentReferenceX;
          } else if (!isIncrementalDirection) {
            return isVerticalDirection ?
              siblingReferenceY <= currentReferenceY : siblingReferenceX <= currentReferenceX;
          }
        }

        return false;
      });

      if (this.debug) {
        this.log('smartNavigate', 'currentReferencePoints', `x: ${currentReferenceX}`, `y: ${currentReferenceY}`);
        this.log(
          'smartNavigate', 'siblings', `${siblings.length} elements:`,
          siblings.map((s) => s.focusKey).join(', '),
          siblings.map((s) => s.node)
        );
      }

      this.visualDebugger && this.visualDebugger.drawPoint(currentReferenceX, currentReferenceY);

      const sortedSiblings = sortBy(siblings, (sibling) => {
        const siblingReferencePoints = SpatialNavigation.getReferencePoints(direction, true, sibling.layout);
        const siblingReferenceX = siblingReferencePoints.resultX;
        const siblingReferenceY = siblingReferencePoints.resultY;

        this.visualDebugger && this.visualDebugger.drawPoint(siblingReferenceX, siblingReferenceY, 'yellow', 6);

        const distance = Math.sqrt(Math.pow((siblingReferenceX - currentReferenceX), 2) +
          Math.pow((siblingReferenceY - currentReferenceY), 2));

        this.log(
          'smartNavigate',
          `distance between ${focusKey} and ${sibling.focusKey} is`,
          distance,
          `(position x: ${siblingReferenceX}, y: ${siblingReferenceY})`
        );

        return distance;
      });

      const nextComponent = first(sortedSiblings);

      this.log(
        'smartNavigate', 'nextComponent',
        nextComponent ? nextComponent.focusKey : undefined,
        nextComponent ? nextComponent.node : undefined
      );

      if (nextComponent) {
        this.setFocus(nextComponent.focusKey);
      } else {
        const parentComponent = this.focusableComponents[parentFocusKey];

        parentComponent && (parentComponent.lastFocusedChildKey = focusKey);

        this.smartNavigate(direction, parentFocusKey);
      }
    }
  }

  log(functionName, debugString, ...rest) {
    if (this.debug) {
      console.log(
        `%c${functionName} %c ${debugString}`,
        `background: ${DEBUG_FN_COLORS[this.logIndex % DEBUG_FN_COLORS.length]}; color: black;`,
        'background: #333; color: #BADA55',
        ...rest
      );
    }
  }

  /**
   * This function tries to determine the next component to Focus
   * It's either the target node OR the one down by the Tree if node has "propagateFocus"
   * Based on "targetFocusKey"
   */
  getNextFocusKey(targetFocusKey) {
    const targetComponent = this.focusableComponents[targetFocusKey];

    /**
     * Security check, if component doesn't exist, stay on the same focusKey
     */
    if (!targetComponent) {
      return targetFocusKey;
    }

    const children = filter(this.focusableComponents, (component) => component.parentFocusKey === targetFocusKey);

    if (children.length > 0 && this.isPropagateFocus(targetFocusKey)) {
      this.onIntermediateNodeBecameFocused(targetFocusKey);

      /**
       * First of all trying to focus last focused child
       */
      const {lastFocusedChildKey} = targetComponent;

      if (lastFocusedChildKey &&
        !targetComponent.forgetLastFocusedChild &&
        this.isFocusableComponent(lastFocusedChildKey)
      ) {
        return this.getNextFocusKey(lastFocusedChildKey);
      }

      /**
       * If there is no lastFocusedChild, trying to focus something by coordinates
       */
      const sortedXChildren = sortBy(children, (child) => child.layout.left);
      const sortedYChildren = sortBy(sortedXChildren, (child) => child.layout.top);
      const {focusKey: childKey} = first(sortedYChildren);

      return this.getNextFocusKey(childKey);
    }

    /**
     * If no children, just return targetFocusKey back
     */
    return targetFocusKey;
  }

  addFocusable({
    focusKey,
    node,
    parentFocusKey,
    onEnterPressHandler,
    onBecameFocusedHandler,
    forgetLastFocusedChild,
    propagateFocus,
    onUpdateFocus,
    onUpdateHasFocusedChild
  }) {
    this.focusableComponents[focusKey] = {
      focusKey,
      node,
      parentFocusKey,
      onEnterPressHandler,
      onBecameFocusedHandler,
      onUpdateFocus,
      onUpdateHasFocusedChild,
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

    this.updateLayout(focusKey);

    /**
     * If for some reason this component was already focused before it was added, call the update
     */
    if (focusKey === this.focusKey) {
      this.setFocus(focusKey);
    }
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
        this.setFocus(parentFocusKey);
      }
    }
  }

  getNodeLayoutByFocusKey(focusKey) {
    const component = this.focusableComponents[focusKey];

    if (component) {
      return component.layout;
    }

    return null;
  }

  setCurrentFocusedKey(focusKey) {
    if (this.isFocusableComponent(this.focusKey) && focusKey !== this.focusKey) {
      const oldComponent = this.focusableComponents[this.focusKey];

      oldComponent.onUpdateFocus(false);
    }

    this.focusKey = focusKey;

    const newComponent = this.focusableComponents[this.focusKey];

    newComponent && newComponent.onUpdateFocus(true);
  }

  updateParentsWithFocusedChild(focusKey) {
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

    const parentsToRemoveFlag = difference(this.parentsHavingFocusedChild, parents);
    const parentsToAddFlag = difference(parents, this.parentsHavingFocusedChild);

    forEach(parentsToRemoveFlag, (parentFocusKey) => {
      const parentComponent = this.focusableComponents[parentFocusKey];

      parentComponent && parentComponent.onUpdateHasFocusedChild(false);
    });

    forEach(parentsToAddFlag, (parentFocusKey) => {
      const parentComponent = this.focusableComponents[parentFocusKey];

      parentComponent && parentComponent.onUpdateHasFocusedChild(true);
    });

    this.parentsHavingFocusedChild = parents;
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

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  setFocus(focusKey, overwriteFocusKey) {
    if (!this.enabled) {
      return;
    }

    const targetFocusKey = overwriteFocusKey && this.isFocusableComponent(overwriteFocusKey) ?
      overwriteFocusKey : focusKey;

    const newFocusKey = this.getNextFocusKey(targetFocusKey);

    this.setCurrentFocusedKey(newFocusKey);
    this.updateParentsWithFocusedChild(newFocusKey);
    this.updateAllLayouts();
  }

  updateAllLayouts() {
    forOwn(this.focusableComponents, (component, focusKey) => {
      this.updateLayout(focusKey);
    });
  }

  updateLayout(focusKey) {
    const component = this.focusableComponents[focusKey];

    if (!component) {
      return;
    }

    const {node} = component;

    measureLayout(node, (x, y, width, height, left, top) => {
      component.layout = {
        x,
        y,
        width,
        height,
        left,
        top
      };
    });
  }

  updateDOMNode(focusKey, node) {
    const component = this.focusableComponents[focusKey];

    if (component) {
      component.node = node;
    }
  }
}

/**
 * Export singleton
 */
export default new SpatialNavigation();
