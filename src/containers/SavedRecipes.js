/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import {
  ScrollView, Alert, RefreshControl, FlatList, View
} from 'react-native';
import {
  Text,
  ButtonGroup
} from 'react-native-elements';


import styles from '../common/styles';
import theme from '../config/theme';
import settings from '../config/settings';

import RecipeItem from '../components/RecipeItem';
import Loading from '../components/Loading';
import HeaderButtonMenu from '../components/HeaderButtonMenu';
import HeaderButtonRecipes from '../components/HeaderButtonRecipes';

import db from '../lib/db';
import logging from '../lib/logging';


type Props = {};

class SavedRecipes extends Component<Props> {
  static navigationOptions = ({ navigation }) => ({
    title: 'Saved Recipes',
    headerLeft: (<HeaderButtonMenu navigation={navigation} />),
    headerRight: (<HeaderButtonRecipes navigation={navigation} />)
  });


  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      user: null,
      showLoading: false,
      selectedMealTypeIndex: 0,
      mealtypesDescriptions: [],
      recipes: []
    };
    this.selectMealType = this.selectMealType.bind(this);
    this.openRecipe = this.openRecipe.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
  }

  async componentDidMount() {
    let { user } = this.state;
    const { navigation } = this.props;
    try {
      user = await db.getAuthUser();
      this.setState({ user });
      await this.loadRecipes();
      this.ListenerOnFocusScreen = navigation.addListener('willFocus', () => this.loadRecipes());
    } catch (error) {
      logging({ user, entry: error });
      Alert.alert(error.message || settings.DEFAULT_ERROR_MESSAGE);
    }
  }

  componentWillUnmount() {
    this.ListenerOnFocusScreen.remove();
  }

  async onRefresh() {
    const { user } = this.state;
    this.setState({ isRefreshing: true });
    try {
      await this.loadRecipes();
    } catch (error) {
      this.setState({ isRefreshing: false });
      logging({ user, entry: error });
      Alert.alert(error.message || settings.DEFAULT_ERROR_MESSAGE);
    } finally {
      this.setState({ isRefreshing: false });
    }
  }

  async loadRecipes() {
    const { user } = this.state;
    this.setState({ showLoading: true });
    const recipes = await db.favorite.getAll({ userId: user.uid });
    const mealtypes = Array.from(new Set(recipes.map(item => item.slot).sort()));
    const mealtypesDescriptions = mealtypes.map(mealTypeIndex => settings.MEAL_TYPE[mealTypeIndex]);
    this.setState({
      user,
      recipes,
      mealtypesDescriptions,
      showLoading: false
    });
  }


  openRecipe(recipe) {
    const { navigation } = this.props;
    navigation.navigate('Recipe', {
      recipe
    });
  }

  selectMealType(selectedMealTypeIndex) {
    this.setState({ selectedMealTypeIndex });
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

  renderRecipesList() {
    const {
      selectedMealTypeIndex, recipes, mealtypesDescriptions
    } = this.state;
    const filteredRecipes = mealtypesDescriptions.length > 1
      ? recipes.filter(item => mealtypesDescriptions[selectedMealTypeIndex].toLowerCase() === settings.MEAL_TYPE[item.slot].toLowerCase())
      : recipes;

    if (filteredRecipes.length > 0) {
      return (
        <FlatList
          keyExtractor={(item, index) => `${index}`}
          data={filteredRecipes}
          renderItem={item => this.renderRecipeItem(item, this)}
        />
      );
    } if (recipes.length === 0) {
      return (<Text style={{ color: theme.NO_DATA_FONT_COLOR, textAlign: 'center', marginTop: 30 }}>There are no favorite recipes.</Text>);
    }
    return (<Text style={{ color: theme.NO_DATA_FONT_COLOR, textAlign: 'center' }}>There are no recipes for this type of meal.</Text>);
  }

  render() {
    const {
      showLoading, selectedMealTypeIndex, isRefreshing, mealtypesDescriptions
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
        {showLoading ? <View style={{ marginTop: 30 }}><Loading show={showLoading} onlySpinner /></View> : null}

        {!showLoading && mealtypesDescriptions.length > 1 ? (
          <ButtonGroup
            onPress={this.selectMealType}
            selectedIndex={selectedMealTypeIndex}
            buttons={mealtypesDescriptions}
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
        ) : null}
        {showLoading ? null : this.renderRecipesList()}
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

export default SavedRecipes;
