/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';
import shuffle from 'lodash/shuffle';
import whyDidRender from '@welldone-software/why-did-you-render';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import withFocusable from './withFocusable';
import SpatialNavigation from './spatialNavigation';

SpatialNavigation.init();

// SpatialNavigation.setKeyMap(keyMap); -> Custom key map

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    maxHeight: 400,
    maxWidth: 800,
    backgroundColor: '#333333',
    flexDirection: 'row'
  },
  content: {
    flex: 1
  },
  menu: {
    maxWidth: 60,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  menuFocused: {
    backgroundColor: '#546e84'
  },
  menuItem: {
    width: 50,
    height: 50,
    backgroundColor: '#f8f258'
  },
  activeWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeProgram: {
    width: 160,
    height: 120
  },
  activeProgramTitle: {
    padding: 20,
    color: 'white'
  },
  programWrapper: {
    padding: 10,
    alignItems: 'center'
  },
  program: {
    height: 100,
    width: 100
  },
  programTitle: {
    color: 'white'
  },
  categoryWrapper: {
    padding: 20
  },
  categoryTitle: {
    color: 'white'
  },
  categoriesWrapper: {
    flex: 1
  },
  focusedBorder: {
    borderWidth: 6,
    borderColor: 'red',
    backgroundColor: 'white'
  }
});

const categories = shuffle([{
  title: 'Featured'
}, {
  title: 'Cool'
}, {
  title: 'Decent'
}]);

const programs = shuffle([{
  title: 'Program 1',
  color: '#337fdd'
}, {
  title: 'Program 2',
  color: '#dd4558'
}, {
  title: 'Program 3',
  color: '#7ddd6a'
}, {
  title: 'Program 4',
  color: '#dddd4d'
}, {
  title: 'Program 5',
  color: '#8299dd'
}, {
  title: 'Program 6',
  color: '#edab83'
}, {
  title: 'Program 7',
  color: '#60ed9e'
}, {
  title: 'Program 8',
  color: '#d15fb6'
}, {
  title: 'Program 9',
  color: '#c0ee33'
}]);

/* eslint-disable react/prefer-stateless-function */
class MenuItem extends React.PureComponent {
  render() {
    // console.log('Menu item rendered: ', this.props.realFocusKey);

    return (<TouchableOpacity style={[styles.menuItem, this.props.focused ? styles.focusedBorder : null]} />);
  }
}

MenuItem.propTypes = {
  focused: PropTypes.bool.isRequired

  // realFocusKey: PropTypes.string.isRequired
};

const MenuItemFocusable = withFocusable()(MenuItem);

class Menu extends React.PureComponent {
  componentDidMount() {
    this.props.setFocus();
  }

  render() {
    // console.log('Menu rendered: ', this.props.realFocusKey);

    return (<View style={[styles.menu, this.props.hasFocusedChild ? styles.menuFocused : null]}>
      <MenuItemFocusable focusKey={'MENU-1'} />
      <MenuItemFocusable focusKey={'MENU-2'} />
      <MenuItemFocusable focusKey={'MENU-3'} />
      <MenuItemFocusable focusKey={'MENU-4'} />
      <MenuItemFocusable focusKey={'MENU-5'} />
      <MenuItemFocusable focusKey={'MENU-6'} />
    </View>);
  }
}

Menu.propTypes = {
  setFocus: PropTypes.func.isRequired,
  hasFocusedChild: PropTypes.bool.isRequired

  // realFocusKey: PropTypes.string.isRequired
};

const MenuFocusable = withFocusable({
  trackChildren: true
})(Menu);

class Content extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      currentProgram: null
    };

    this.onProgramPress = this.onProgramPress.bind(this);
  }

  onProgramPress(program) {
    this.setState({
      currentProgram: program
    });
  }

  render() {
    // console.log('content rendered: ', this.props.realFocusKey);

    return (<View style={styles.content}>
      <Active program={this.state.currentProgram} />
      <CategoriesFocusable
        focusKey={'CATEGORIES'}
        propagateFocus
        onProgramPress={this.onProgramPress}
      />
    </View>);
  }
}

Content.propTypes = {
  // realFocusKey: PropTypes.string.isRequired
};

const ContentFocusable = withFocusable()(Content);

class Active extends React.PureComponent {
  render() {
    const {program} = this.props;

    const style = {
      backgroundColor: program ? program.color : 'grey'
    };

    return (<View style={styles.activeWrapper}>
      <View style={[style, styles.activeProgram]} />
      <Text style={styles.activeProgramTitle}>
        {program ? program.title : 'No Program'}
      </Text>
    </View>);
  }
}

Active.propTypes = {
  program: PropTypes.shape({
    title: PropTypes.string.isRequired
  })
};

Active.defaultProps = {
  program: null
};

class Program extends React.PureComponent {
  render() {
    // console.log('Program rendered: ', this.props.realFocusKey);

    const {color, onPress, focused, title} = this.props;

    const style = {
      backgroundColor: color
    };

    return (<TouchableOpacity
      onPress={onPress}
      style={styles.programWrapper}
    >
      <View style={[style, styles.program, focused ? styles.focusedBorder : null]} />
      <Text style={styles.programTitle}>
        {title}
      </Text>
    </TouchableOpacity>);
  }
}

Program.propTypes = {
  title: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  focused: PropTypes.bool.isRequired

  // realFocusKey: PropTypes.string.isRequired
};

const ProgramFocusable = withFocusable()(Program);

class Category extends React.PureComponent {
  constructor(props) {
    super(props);

    this.scrollRef = null;

    this.onProgramFocused = this.onProgramFocused.bind(this);
  }

  onProgramFocused({x}) {
    this.scrollRef.scrollTo({
      x
    });
  }

  render() {
    // console.log('Category rendered: ', this.props.realFocusKey);

    return (<View style={styles.categoryWrapper}>
      <Text style={styles.categoryTitle}>
        {this.props.title}
      </Text>
      <ScrollView
        horizontal
        ref={(reference) => {
          if (reference) {
            this.scrollRef = reference;
          }
        }}
      >
        {programs.map((program, index) => ((<ProgramFocusable
          {...program}
          focusKey={`PROGRAM-${this.props.realFocusKey}-${index}`}
          onPress={() => {
            this.props.onProgramPress(program);
          }}
          onEnterPress={() => {
            this.props.onProgramPress(program);
          }}
          key={program.title}
          onBecameFocused={this.onProgramFocused}
        />)))}
      </ScrollView>
    </View>);
  }
}

Category.propTypes = {
  title: PropTypes.string.isRequired,
  onProgramPress: PropTypes.func.isRequired,
  realFocusKey: PropTypes.string.isRequired
};

const CategoryFocusable = withFocusable()(Category);

class Categories extends React.PureComponent {
  constructor(props) {
    super(props);

    this.scrollRef = null;

    this.onCategoryFocused = this.onCategoryFocused.bind(this);
  }

  onCategoryFocused({y}) {
    this.scrollRef.scrollTo({
      y
    });
  }

  render() {
    // console.log('Categories rendered: ', this.props.realFocusKey);

    return (<ScrollView
      ref={(reference) => {
        if (reference) {
          this.scrollRef = reference;
        }
      }}
      style={styles.categoriesWrapper}
    >
      {categories.map((category, index) => (<CategoryFocusable
        focusKey={`CATEGORY-${index}`}
        {...category}
        onProgramPress={this.props.onProgramPress}
        key={category.title}
        propagateFocus
        onBecameFocused={this.onCategoryFocused}
      />))}
    </ScrollView>);
  }
}

Categories.propTypes = {
  onProgramPress: PropTypes.func.isRequired,
  realFocusKey: PropTypes.string.isRequired
};

const CategoriesFocusable = withFocusable()(Categories);

class Spatial extends React.PureComponent {
  render() {
    return (<View style={styles.wrapper}>
      <MenuFocusable
        focusKey={'MENU'}
        propagateFocus
      />
      <ContentFocusable
        focusKey={'CONTENT'}
        propagateFocus
      />
    </View>);
  }
}

const App = () => (<View>
  <Spatial />
</View>);

whyDidRender(React);

export default App;
