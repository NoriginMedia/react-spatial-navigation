# react-spatial-navigation
## Motivation
## Article

# Table of Contents
* [Example](#example)
* [Installation](#installation)
* [Usage](#usage)
* [API](#api)
* [Development](#development)
* [TODOs](#todos)

# Example
![Spatial Navigation example](resources/images/spatial-nav-example.gif)

[Testbed Example](https://github.com/NoriginMedia/react-spatial-navigation/blob/master/src/App.js)

# Installation
## NPM
Will be published soon ¯\\\_(ツ)_/¯
## package.json
```json
...
"react-spatial-navigation": "git+https://github.com/NoriginMedia/react-spatial-navigation.git#master"
...
```

# Usage

## Initialization
```jsx
// Somewhere at the root of the app

import {initNavigation, setKeyMap} from 'react-spatial-navigation';

initNavigation();
setKeyMap({
  'left': 9001,
  'up': 9002,
  'right': 9003,
  'down': 9004,
  'enter': 9005
});
```

## Making component focusable
```jsx
import {withFocusable} from 'react-spatial-navigation';

...

const FocusableComponent = withFocusable()(Component);
```

## Using config options
```jsx
import {withFocusable} from 'react-spatial-navigation';

...

const FocusableComponent = withFocusable({
  propagateFocus: true,
  trackChildren: true,
  forgetLastFocusedChild: true
})(Component);
```

## Using props on focusable components
```jsx
import {withFocusable} from 'react-spatial-navigation';

...

const FocusableComponent = withFocusable()(Component);

const ParentComponent = (props) => (<View>
  ...
  <FocusableComponent 
    propagateFocus
    trackChildren
    forgetLastFocusedChild
    focusKey={'FOCUSABLE_COMPONENT'}
    onEnterPress={props.onItemPress}
    onBecameFocused={props.onItemFocused}
  />
  ...
</View>);
```

## Using props inside wrapped components
### Basic usage
```jsx
import {withFocusable} from 'react-spatial-navigation';

const Component = ({focused, setFocus}) => (<View>
  <View style={focused ? styles.focusedStyle : styles.defaultStyle} />
  <TouchableOpacity 
    onPress={() => {
      setFocus('SOME_ANOTHER_COMPONENT');
    }}
  />
</View>);

const FocusableComponent = withFocusable()(Component);
```

### Setting initial focus on child component, tracking children
```jsx
import React, {PureComponent} from 'react';
import {withFocusable} from 'react-spatial-navigation';

...

class Menu extends PureComponent {
  componentDidMount() {
    // this.props.setFocus(); // If you need to focus first child automatically
    this.props.setFocus('MENU-6'); // If you need to focus specific item that you know focus key of
  }

  render() {
    return (<View style={hasFocusedChild ? styles.menuExpanded : styles.defaultStyle}>
      <MenuItemFocusable />
      <MenuItemFocusable />
      <MenuItemFocusable />
      <MenuItemFocusable />
      <MenuItemFocusable />
      <MenuItemFocusable focusKey={'MENU-6'} />
    </View>);
  }
}

const MenuFocusable = withFocusable({
  trackChildren: true,
  propagateFocus: true
})(Menu);
```

# API

## Top level
### initNavigation: function
Function that needs to called to enable Spatial Navigation system and bind key event listeners.
No arguments needed.

### setKeyMap: function
Function to set custom key codes.
```
setKeyMap({
  'left': 9001,
  'up': 9002,
  'right': 9003,
  'down': 9004,
  'enter': 9005
});
```

### withFocusable: function
Main HOC wrapper function. Accepts [config](#config) as a param.
```jsx
const FocusableComponent = withFocusable({...})(Component);
```

## Config
### propagateFocus: boolean
Determine whether to automatically propagate focus to child focusable component when this component gets focused.

* **false (default)**
* **true**

### trackChildren: boolean
Determine whether to track when any child component is focused. Wrapped component can rely on `hasFocusedChild` prop when this mode is enabled. Otherwise `hasFocusedChild` will be always `false`.

* **false (default)** - Disabled by default because it causes unnecessary render call when `hasFocusedChild` changes
* **true**

### forgetLastFocusedChild: boolean
Determine whether this component should not remember the last focused child components. By default when focus goes away from the component and then it gets focused again, it will focus the last focused child. This functionality is enabled by default.

* **false (default)**
* **true**

## Props that can be applied to HOC
All these props are optional.

### propagateFocus: boolean
Same as in [config](#config).

### trackChildren: boolean
Same as in [config](#config).

### forgetLastFocusedChild: boolean
Same as in [config](#config).

### focusKey: string
String that is used as a component focus key. Should be **unique**, otherwise it will override previously stored component with the same focus key in the Spatial Navigation service storage of focusable components. If this is not specified, the focus key will be generated automatically.

### onEnterPress: function
Callback function that is called when the item is currently focused and Enter (OK) key is pressed.

Payload:
All the props passed to HOC is passed back to this callback. Useful to avoid creating callback functions during render.

```jsx
const onPress = ({prop1, prop2}) => {...};

...
<FocusableItem 
  prop1={111}
  prop2={222}
  onPress={onPress}
/>
...
```

### onBecameFocused: function
Callback function that is called when the item becomes focused directly or during propagation of the focus to the children components. For example when you have nested tree of 5 focusable components, each of which has `propagateFocus`, this callback will be called on every level of propagation.

Payload:
Component layout object is passed as a first param. All the component props passed back to this callback. Useful to avoid creating callback functions during render. `x` and `y` are relative coordinates to parent DOM (**not the Focusable parent**) element. `left` and `top` are absolute coordinates on the screen.

```jsx
const onFocused = ({width, height, x, y, top, left}, {prop1, prop2}) => {...};

...
<FocusableItem 
  prop1={111}
  prop2={222}
  onBecameFocused={onFocused}
/>
...
```

## Props passed to Wrapped Component
### focusKey: string
Focus key that represents the focus key that was applied to HOC component. Might be `null` when not set. It is recommended to not rely on this prop ¯\\\_(ツ)_/¯

### realFocusKey: string
Focus key that is either the `focusKey` prop of the HOC, or automatically generated focus key like `sn:focusable-item-23`.

### parentFocusKey: string
Focus key of the parent component. If it is a top level focusable component, this prop will be `SN:ROOT`

### focused: boolean
Whether component is currently focused. It is only `true` if this exact component is focused, e.g. when this component propagates focus to child component, this value will be `false`.

### hasFocusedChild: boolean
This prop indicates that the component currently has some focused child on any depth of the focusable tree.

### setFocus: function
This method sets the focus to another component (when focus key is passed as param) or steals the focus to itself (when used w/o params).

```
setFocus(); // set focus to self
setFocus('SOME_COMPONENT'); // set focus to another component if you know its focus key
```

### pauseSpatialNavigation: function
This function pauses key listeners. Useful when you need to temporary disable navigation. (e.g. when player controls are hidden during video playback and you want to bind the keys to show controls again).

### resumeSpatialNavigation: function
This function resumes key listeners if it was paused with [pauseSpatialNavigation](#pauseSpatialNavigation)

# Development
This library is using Parcel to serve the web build.

To run the testbed app locally:
```
npm start
```
This will start local server on `localhost:1234`

Source code is in `src/App.js`

# TODOs
- [ ] Implement more advanced coordination calculation [algorithm](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox_OS_for_TV/TV_remote_control_navigation#Algorithm_design).
- [ ] Add debug mode to output most important steps when making decisions on the next focused component during navigation, printing reference to DOM element to highlight it on the screen.
- [ ] Visual debugging. Draw debug canvas on top of focusable component to visually see its coordinates and dimensions.
- [ ] Refactor with React Hooks instead of recompose.
- [ ] Implement HOC for react-native tvOS and AndroidTV components.

---

# License
**MIT Licensed**
