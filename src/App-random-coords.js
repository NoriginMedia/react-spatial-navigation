/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';
import random from 'lodash/random';
import uniqueId from 'lodash/uniqueId';
import {View, StyleSheet} from 'react-native';
import withFocusable from './withFocusable';
import SpatialNavigation from './spatialNavigation';

const VIEW_HEIGHT = 720;
const VIEW_WIDTH = 1280;

const colors = [
  '#337fdd',
  '#dd4558',
  '#7ddd6a',
  '#dddd4d',
  '#8299dd',
  '#edab83',
  '#60ed9e',
  '#d15fb6',
  '#c0ee33'
];

const squares = [];

for (let i = 0; i < 20; i++) {
  const boxHeight = random(50, 200);
  const boxWidth = random(50, 200);

  squares.push({
    id: uniqueId(),
    width: boxWidth,
    height: boxHeight,
    top: random(0, VIEW_HEIGHT - boxHeight - 20),
    left: random(0, VIEW_WIDTH - boxWidth - 20),
    backgroundColor: colors[random(0, colors.length - 1)]
  });
}

SpatialNavigation.init({
  debug: true,
  visualDebug: true
});

// SpatialNavigation.setKeyMap(keyMap); -> Custom key map

const styles = StyleSheet.create({
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

const Box = ({top, left, width, height, backgroundColor, focused}) => {
  const style = {
    top,
    left,
    width,
    height,
    backgroundColor
  };

  return (<View style={[styles.box, style, focused ? styles.boxFocused : null]} />);
};

Box.propTypes = {
  top: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  focused: PropTypes.bool.isRequired
};

const BoxFocusable = withFocusable()(Box);

class Spatial extends React.PureComponent {
  componentDidMount() {
    this.props.setFocus();
  }

  render() {
    return (<View style={styles.wrapper}>
      {squares.map(({id, ...rest}) => (<BoxFocusable
        key={id}
        {...rest}
      />))}
    </View>);
  }
}

Spatial.propTypes = {
  setFocus: PropTypes.func.isRequired
};

const SpatialFocusable = withFocusable()(Spatial);

const App = () => (<View>
  <SpatialFocusable />
</View>);

export default App;
