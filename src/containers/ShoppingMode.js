/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-undef */
/* eslint-disable no-alert */
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Icon, CheckBox, ButtonGroup } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
// import Collapsible from 'react-native-collapsible';
import Accordion from 'react-native-collapsible/Accordion';

import commonStyles from '../common/styles';
import theme from '../config/theme';
import settings from '../config/settings';

import db from '../lib/db';
import logging from '../lib/logging';

import HeaderButtonMenu from '../components/HeaderButtonMenu';
import HeaderButtonRecipes from '../components/HeaderButtonRecipes';

type Props = {};

class ShoppingMode extends Component<Props> {
  static navigationOptions = ({ navigation }) => ({
    title: 'Shopping List',
    headerLeft: (<HeaderButtonMenu navigation={navigation} />),
    headerRight: (<HeaderButtonRecipes navigation={navigation} />)
    // header: null
  });

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      shoppingListStatuses: [],
      selectedDayIndex: 0,
      recipes: [],
      activeSections: [],
      collapsed: true
    };
    this.selectDay = this.selectDay.bind(this);
  }

  async componentDidMount() {
    try {
      const user = await db.getAuthUser();
      const recipes = await db.getRecipes({ userId: user.uid });
      const shoppingListStatuses = await db.getShoppingList();
      const mappedRecipes = recipes.map((recipe) => {
        const {
          info, day, slot, value
        } = recipe;
        const recipeInfo = JSON.parse(value);
        return {
          day,
          title: `${settings.MEAL_TYPE[slot]}`,
          recipeId: recipeInfo.id,
          onPressCheckbox: this.setItemStatus.bind(this),
          getItemStatus: this.getItemStatus.bind(this),
          items: info.extendedIngredients.map(item => ({
            id: item.id,
            label: `${item.name} (${item.amount} ${item.unit})`
          }))
        };
      });
      this.setState(previous => ({
        user,
        shoppingListStatuses:
          shoppingListStatuses || previous.shoppingListStatuses,
        recipes: mappedRecipes
      }));
      this.setSections([0]);
    } catch (error) {
      logging({ user: this.state.user, entry: error });
      alert('Sorry, try again later.');
    }
  }

  getItemStatus({ recipeId, itemId }) {
    const { shoppingListStatuses } = this.state;
    const foundItemIndex = shoppingListStatuses.findIndex(
      item => item.recipeId === recipeId && item.itemId === itemId
    );
    if (foundItemIndex >= 0) {
      return shoppingListStatuses[foundItemIndex];
    }
    return false;
  }

  setItemStatus({ recipeId, itemId, itemStatus }) {
    const { shoppingListStatuses } = this.state;
    const foundItem = this.getItemStatus({ recipeId, itemId });
    if (foundItem) {
      foundItem.isChecked = itemStatus;
    } else {
      shoppingListStatuses.push({
        recipeId,
        itemId,
        isChecked: itemStatus
      });
    }

    db.storeShoppingList(shoppingListStatuses).then(() => {
      this.setState({ shoppingListStatuses });
    });
  }

  toggleExpanded = () => {
    this.setState(previous => ({ collapsed: !previous.collapsed }));
  };

  setSections = (sections) => {
    this.setState({
      activeSections: sections.includes(undefined) ? [] : sections
    });
  };

  selectDay(selectedDayIndex) {
    this.setState({
      selectedDayIndex
    });
  }

  renderHeader = (section, index, isActive) => (
    <Animatable.View
      duration={200}
      style={[styles.header, isActive ? styles.active : styles.inactive]}
      transition="backgroundColor"
    >
      <Text style={[styles.headerText, isActive ? styles.headerTextActive : styles.headerTextInactive]}>{section.title}</Text>
    </Animatable.View>
  );

  // renderItem(item, index) {
  // if (!this.state) {
  //   return null;
  // }
  // const { shoppingListStatuses } = this.state;
  // if (!shoppingListStatuses) {
  //   return null;
  // }

  // const { isChecked } =
  //   shoppingListStatuses.find(
  //     (record) =>
  //       record.recipeId === section.recipeId && record.itemId === item.id
  //   ) || false;
  //   const isChecked = false;
  // }

  // eslint-disable-next-line class-methods-use-this
  renderContent(section, index, isActive) {
    return (
      <Animatable.View
        duration={400}
        style={[{}, isActive ? styles.active : styles.inactive]}
        transition="backgroundColor"
      >
        {section.items.map((item, i) => {
          const { isChecked } = section.getItemStatus({
            recipeId: section.recipeId,
            itemId: item.id
          }) || false;
          return (
            <CheckBox
              key={i}
              checkedColor={theme.BUTTON_BACKGROUND_COLOR}
              onPress={() => section.onPressCheckbox({
                recipeId: section.recipeId,
                itemId: item.id,
                itemStatus: !isChecked
              })
              }
              containerStyle={{
                borderWidth: 0,
                backgroundColor: 'transparent'
              }}
              textStyle={{ color: theme.FONT_BODY_COLOR }}
              title={item.label}
              checked={isChecked}
            />
          );
        })}
      </Animatable.View>
    );
  }

  render() {
    const { activeSections, recipes, selectedDayIndex } = this.state;
    return (
      <ScrollView style={commonStyles.scrollViewList}>
        <ButtonGroup
          onPress={this.selectDay}
          selectedIndex={selectedDayIndex}
          buttons={settings.WEEK_DAYS}
          textStyle={{ color: theme.FONT_BODY_COLOR }}
          selectedButtonStyle={{ backgroundColor: theme.BUTTON_BACKGROUND_COLOR }}
          containerStyle={{
            marginTop: 30,
            marginBottom: 30,
            backgroundColor: 'transparent',
            borderColor: theme.BORDER_COLOR
          }}
          innerBorderStyle={{ color: theme.BORDER_COLOR }}
        />
        <Accordion
          activeSections={activeSections}
          sections={recipes.filter(item => selectedDayIndex + 1 === item.day)}
          touchableComponent={TouchableOpacity}
          expandMultiple={false}
          renderHeader={this.renderHeader}
          renderContent={this.renderContent}
          duration={300}
          onChange={this.setSections}
        />
        <View style={{ marginTop: 50 }} />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '300',
    marginBottom: 20,
    // padding: 10
  },
  header: {
    // borderBottomWidth: 0.5,
    // borderBottomColor: theme.DIVIDER_COLOR,
    width: '100%'
  },
  headerTextInactive: {
    backgroundColor: theme.MAIN_BACKGROUND_COLOR
  },
  headerTextActive: {
    backgroundColor: theme.CONTENT_BACKGROUND_COLOR,
    padding: 15
  },
  headerText: {
    textAlign: 'left',
    color: theme.TITLE_COLOR,
    fontSize: 20
  },
  active: {
    // borderBottomWidth: 0,
    // backgroundColor: theme.CONTENT_BACKGROUND_COLOR
  },
  inactive: {
    padding: 15,
    // backgroundColor: theme.MAIN_BACKGROUND_COLOR
  }
});
export default ShoppingMode;
