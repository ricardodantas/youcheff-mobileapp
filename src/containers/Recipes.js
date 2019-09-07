/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import {
  ScrollView, Alert, RefreshControl, FlatList, StatusBar
} from 'react-native';
import {
  Icon,
  ButtonGroup
} from 'react-native-elements';
import moment from 'moment';

import styles from '../common/styles';
import theme from '../config/theme';
import settings from '../config/settings';

import RecipeItem from '../components/RecipeItem';
import Loading from '../components/Loading';
import { getWeekRecipes } from '../lib/recipesApi';
import HeaderButtonMenu from '../components/HeaderButtonMenu';

import db from '../lib/db';
import logging from '../lib/logging';
import * as pushNotifications from '../lib/pushNotification';

type Props = {};

class Recipes extends Component<Props> {
  static navigationOptions = ({ navigation, state }) =>
  // let selectedDayIndex = 0;
  // if (state.selectedDayIndex) {
  //   selectedDayIndex = state.selectedDayIndex
  // }

    ({
      title: 'Recipes',
      headerLeft: (<HeaderButtonMenu navigation={navigation} />),
      headerRight: (
        <Icon
          name="shopping-cart"
          type="entypo"
          reverseColor={theme.HEADER_BACKGROUND_COLOR}
          color={theme.HEADER_FONT_COLOR}
          containerStyle={{ marginRight: theme.HEADER_MARGIN_RIGHT }}
          underlayColor={theme.HEADER_BACKGROUND_COLOR}
          onPress={() => navigation.navigate('ShoppingMode', { selectedDayIndex: 0 })
          }
        />
      )
      // header: null
    });


  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      user: null,
      showLoading: false,
      selectedDayIndex: 0,
      recipes: []
    };
    this.selectDay = this.selectDay.bind(this);
    this.openRecipe = this.openRecipe.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
  }


  // eslint-disable-next-line react/sort-comp
  async isValidSubscription({ userId }) {
    const firstTimeRun = await db.storeFirstTimeRun({ userId });
    const daysSinceFirstTimeRun = moment().diff(firstTimeRun, 'days');
    const subscriptionInfo = await db.getUserSubscription({ userId });
    const trialFinished = daysSinceFirstTimeRun > settings.TRIAL_DAYS;
    if ((subscriptionInfo && subscriptionInfo.transactionReceipt) || !trialFinished) return true;
    return false;
  }

  async componentDidMount() {
    try {
      this.removeNotificationOpenedListener = await pushNotifications.onNotificationOpened((message) => {
        Alert.alert(message.title, message.subtitle);
      });
      this.messageListener = await pushNotifications.onMessage((message) => {
        const { data } = message;
        Alert.alert(data.title, data.subtitle);
      });

      const { navigation } = this.props;
      const user = await db.getAuthUser();
      this.setState({ user });
      const userHasValidSubscription = await this.isValidSubscription({ userId: user.uid });
      if (userHasValidSubscription) {
        await this.loadRecipes();
      } else {
        navigation.navigate('Subscribe', {
          trialFinished: true
        });
      }
    } catch (error) {
      Alert.alert(error.message || settings.DEFAULT_ERROR_MESSAGE);
    }
  }

  componentWillUnmount() {
    this.messageListener();
    this.removeNotificationOpenedListener();
  }

  // eslint-disable-next-line react/sort-comp
  async loadRecipes(forceReload = false) {
    const { user } = this.state;
    const { navigation } = this.props;
    try {
      this.setState({ showLoading: true });
      let recipes = await db.getRecipes({ userId: user.uid });
      const shouldUpdateOnMonday = await this.shouldUpdateOnMonday();
      if (!recipes || forceReload || shouldUpdateOnMonday) {
        let userPreferences = await db.getUserPreferences({ userId: user.uid });
        if (!userPreferences) {
          userPreferences = settings.DEFAULT_USER_PREFERENCES;
        }

        const resultRequest = await getWeekRecipes({
          caloriesPerMeal: userPreferences.caloriesPerMeal || null,
          diet: userPreferences.diet || null,
          exclude: userPreferences.allergies ? userPreferences.allergies.join(',') : null
        });

        if (resultRequest && resultRequest.items && resultRequest.items.length) {
          recipes = resultRequest.items;
          await db.storeRecipes({ recipes, userId: user.uid });
        } else if (resultRequest.items.length === 0) {
          Alert.alert('Sorry, no recipes found. Please, review your preferences.', '', [{
            text: 'Open preferences',
            onPress: () => {
              navigation.navigate('Preferences', { previousScreen: 'Recipes' });
            }
          }]);
        }
      }
      this.setState({ recipes });
    } catch (error) {
      logging({ user, entry: error });
      setTimeout(() => Alert.alert(error.message || settings.DEFAULT_ERROR_MESSAGE), 200);
    } finally {
      this.setState({ showLoading: false });
    }
  }

  openRecipe(recipe) {
    const { navigation } = this.props;
    navigation.navigate('Recipe', {
      recipe
    });
  }

  selectDay(selectedDayIndex) {
    this.setState({ selectedDayIndex });
  }

  onRefresh() {
    this.setState({ isRefreshing: true });
    Alert.alert(settings.CONFIRM_REFRESH_RECIPES_TITLE, settings.CONFIRM_REFRESH_RECIPES_TEXT, [{
      text: 'Refresh',
      onPress: async () => {
        await this.loadRecipes(true);
        this.setState({ isRefreshing: false });
      }
    },
    {
      text: 'Cancel',
      onPress: () => { this.setState({ isRefreshing: false }); },
      style: 'cancel'
    }
    ], {
      cancelable: true,
      onDismiss: () => { this.setState({ isRefreshing: false }); }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async shouldUpdateOnMonday() {
    const currentWeekDay = moment().day();// 1 monday
    let appSettings = await db.getAppSettings();
    if (currentWeekDay === 1) {
      if (!appSettings.lastRecipesFetchDate || moment(moment().format('YYYY-MM-DD')).isAfter(appSettings.lastRecipesFetchDate)) {
        appSettings = Object.assign({}, appSettings || {}, {
          lastRecipesFetchDate: moment().format('YYYY-MM-DD')
        });
        await db.storeAppSettings(appSettings);
        return true;
      }
    }
    return false;
  }

  renderRecipeItem(recipeItem, _) {
    const { item } = recipeItem;
    return (
      <RecipeItem
        handleClick={() => _.openRecipe(item)}
        day={item.day}
        slot={item.slot}
        info={item.info}
      />
    );
  }

  render() {
    const {
      showLoading, selectedDayIndex, recipes, isRefreshing
    } = this.state;

    return (
      <ScrollView
        style={styles.scrollView}
        refreshControl={(
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={this.onRefresh}
          />
        )}
      >
        <StatusBar backgroundColor={theme.HEADER_BACKGROUND_COLOR} barStyle="light-content" />
        <ButtonGroup
          onPress={this.selectDay}
          selectedIndex={selectedDayIndex}
          buttons={settings.WEEK_DAYS}
          textStyle={{ color: theme.FONT_BODY_COLOR }}
          selectedButtonStyle={{ backgroundColor: theme.BUTTON_BACKGROUND_COLOR }}
          containerStyle={{
            marginTop: 30,
            marginBottom: 30,
            backgroundColor: theme.MAIN_BACKGROUND_COLOR,
            borderColor: theme.BORDER_COLOR
          }}
          innerBorderStyle={{ color: theme.BORDER_COLOR }}
        />
        <Loading show={showLoading && !isRefreshing} onlySpinner />
        <FlatList
          keyExtractor={(item, index) => `${index}`}
          data={recipes.filter(item => selectedDayIndex + 1 === item.day)}
          renderItem={item => this.renderRecipeItem(item, this)}
        />
      </ScrollView>
    );
  }
}

// const styles = StyleSheet.create({
//   welcome: {
//     fontSize: 20,
//     textAlign: 'center',
//     margin: 10,
//   },
//   instructions: {
//     textAlign: 'center',
//     color: '#333333',
//     marginBottom: 5,
//   },
// });

export default Recipes;
