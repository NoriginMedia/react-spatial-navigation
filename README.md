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
## Config
## Props applied to HOC
## Props passed to Wrapped Component

# Development
This library is using Parcel to serve the web build.

To run the testbed app locally:
```
npm start
```
This will start local server on `localhost:1234`

Source code is in `src/App.js`

# TODOs
- [ ] Add debug mode to output most important steps when making decisions on the next focused component during navigation, printing reference to DOM element to highlight it on the screen.
- [ ] Visual debugging. Draw debug canvas on top of focusable component to visually see its coordinates and dimensions.
- [ ] Refactor with React Hooks instead of recompose.
- [ ] Implement HOC for react-native tvOS and AndroidTV components.

# License
MIT Licensed
