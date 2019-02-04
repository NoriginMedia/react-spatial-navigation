import {AppRegistry} from 'react-native';
import App from './src/App';

AppRegistry.registerComponent('spatialNavDemo', () => App);

AppRegistry.runApplication('spatialNavDemo', {
  initialProps: {},
  rootTag: document.getElementById('app')
});
