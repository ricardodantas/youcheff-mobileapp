import { createSwitchNavigator, createStackNavigator, createAppContainer } from 'react-navigation';
import {
  fromLeft, fromRight, zoomIn, fadeIn, fromBottom
} from 'react-navigation-transitions';

import Recipes from './Recipes';
import Recipe from './Recipe';
import ShoppingMode from './ShoppingMode';
import Login from './Login';
import Menu from './Menu';
import Preferences from './Preferences';
import AuthLoadingScreen from './AuthLoadingScreen';
import Subscribe from './Subscribe';
import SavedRecipes from './SavedRecipes';

import theme from '../config/theme';


const handleCustomTransition = ({ scenes }) => {
  // const prevScene = scenes[scenes.length - 2];
  const nextScene = scenes[scenes.length - 1];

  // Custom transitions go there
  // if (prevScene
  //   && prevScene.route.routeName === 'Recipes'
  //   && nextScene.route.routeName === 'ShoppingMode') {
  //   return fromRight();
  // }
  switch (nextScene.route.routeName) {
    case 'Recipe':
      return fromBottom();
    case 'SavedRecipes':
    case 'Recipes':
    case 'ShoppingMode':
      return fromRight();
    case 'Menu':
      return fromBottom();
    default:
      return fadeIn();
  }
};

const AppStack = createStackNavigator({
  Recipes: { screen: Recipes },
  Recipe: { screen: Recipe },
  ShoppingMode: { screen: ShoppingMode },
  SavedRecipes: { screen: SavedRecipes },
  Menu: { screen: Menu },
  Preferences: { screen: Preferences },
  Subscribe: { screen: Subscribe }
}, {
  initialRouteName: 'Recipes',
  transitionConfig: nav => handleCustomTransition(nav),
  defaultNavigationOptions: {
    gesturesEnabled: false,
    headerTintColor: theme.HEADER_FONT_COLOR,
    headerStyle: {
      backgroundColor: theme.HEADER_BACKGROUND_COLOR,
      borderBottomWidth: 0
    },
  }
});


const AuthStack = createStackNavigator({
  Login: {
    screen: Login
  }
}, {
  defaultNavigationOptions: {
    gesturesEnabled: false,
    header: null
  }
});


export default createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'AuthLoading',
  }
));
