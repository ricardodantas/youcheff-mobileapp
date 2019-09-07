import React, { Component } from 'react';
import {
  StyleSheet, ScrollView, View, StatusBar
} from 'react-native';
import {
  Icon, Text, Slider, CheckBox
} from 'react-native-elements';

import theme from '../config/theme';
import settings from '../config/settings';

import commonStyles from '../common/styles';

// import Divider from '../components/Divisor';
import db from '../lib/db';

class Preferences extends Component<Props> {
  static navigationOptions = ({ navigation }) => {
    const isPreviousMenu = navigation.getParam('isPreviousMenu', false);
    const navigateTo = isPreviousMenu ? 'Menu' : 'Recipes';
    return {
      title: 'Preferences',
      headerLeft: null,
      headerRight: (
        <Icon
          name="close"
          type="material-community"
          reverseColor={theme.HEADER_BACKGROUND_COLOR}
          underlayColor={theme.HEADER_BACKGROUND_COLOR}
          color={theme.HEADER_FONT_COLOR}
          containerStyle={{ marginRight: theme.HEADER_MARGIN_RIGHT }}
          onPress={() => navigation.navigate(navigateTo, {})
          }
        />
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      userPreferences: settings.DEFAULT_USER_PREFERENCES
    };
    this.selectAllergy = this.selectAllergy.bind(this);
    this.selectDiet = this.selectDiet.bind(this);
    this.setCaloriesPerMeal = this.setCaloriesPerMeal.bind(this);
    // this.onClose = this.onClose.bind(true);
  }


  async componentDidMount() {
    const user = await db.getAuthUser();
    this.setState({ user });
    const userPreferences = await db.getUserPreferences({ userId: user.uid });
    if (userPreferences) this.setState({ userPreferences });
  }

  // componentWillUnmount() {
  //   this.onClose();
  // }

  // onClose() {
  //   const { userPreferences } = this.state;
  //   // console.warn('asd: ', userPreferences);
  //   if (userPreferences) {
  //     return db.storeUserPreferences(userPreferences);
  //   }
  //   return true;
  // }

  async setCaloriesPerMeal(caloriesPerMeal) {
    const { userPreferences, user } = this.state;
    userPreferences.caloriesPerMeal = caloriesPerMeal;
    this.setState({ userPreferences });
    await db.storeUserPreferences({ preferences: userPreferences, userId: user.uid });
  }

  async selectAllergy(item) {
    const { userPreferences, user } = this.state;
    const { allergies } = userPreferences;
    const allergyIndex = allergies.findIndex(i => i === item);
    if (allergyIndex >= 0) {
      allergies.splice(allergyIndex, 1);
    } else {
      allergies.push(item);
    }
    this.setState({ userPreferences });
    await db.storeUserPreferences({ preferences: userPreferences, userId: user.uid });
  }

  async selectDiet(diet) {
    const { userPreferences, user } = this.state;
    if (userPreferences.diet === diet) {
      userPreferences.diet = null;
    } else {
      userPreferences.diet = diet;
    }
    this.setState({ userPreferences });
    await db.storeUserPreferences({ preferences: userPreferences, userId: user.uid });
  }

  render() {
    const { userPreferences } = this.state;
    return (
      <ScrollView style={commonStyles.scrollView}>
        <StatusBar backgroundColor={theme.HEADER_BACKGROUND_COLOR} barStyle="light-content" />
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Calories per meal</Text>
          <View style={{ ...styles.sectionItemsContainer, marginTop: 15 }}>
            <Slider
              minimumTrackTintColor={theme.BUTTON_BACKGROUND_COLOR}
              thumbTintColor={theme.BUTTON_BACKGROUND_COLOR}
              minimumValue={100}
              maximumValue={10 * 1000}
              step={100}
              onValueChange={value => this.setCaloriesPerMeal(value)}
              value={userPreferences.caloriesPerMeal}
            />
            <Text style={{ textAlign: 'center', color: theme.FONT_BODY_COLOR }}>
              {`${userPreferences.caloriesPerMeal}`}
            </Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Allergies</Text>
          <View style={styles.sectionItemsContainer}>
            {settings.ALLERGY_OPTIONS.map((item, index) => (
              <CheckBox
                key={index}
                checkedColor={theme.BUTTON_BACKGROUND_COLOR}
                onPress={() => this.selectAllergy(item)}
                containerStyle={{
                  borderWidth: 0,
                  backgroundColor: 'transparent'
                }}
                textStyle={{ color: theme.FONT_BODY_COLOR }}
                title={item}
                checked={userPreferences.allergies.includes(item)}
              />
            ))}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Diet</Text>
          <View style={styles.sectionItemsContainer}>
            {settings.DIET_OPTIONS.map((item, index) => (
              <CheckBox
                key={index}
                checkedColor={theme.BUTTON_OK_BACKGROUND_COLOR}
                onPress={() => this.selectDiet(item)}
                containerStyle={{
                  borderWidth: 0,
                  backgroundColor: 'transparent'
                }}
                textStyle={{ color: theme.FONT_BODY_COLOR }}
                title={item}
                checked={userPreferences.diet === item}
              />
            ))}
          </View>

        </View>

      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  sectionContainer: {
    // paddingLeft: 15,
    // paddingRight: 15,
    marginBottom: 35
  },
  sectionDescription: {
    fontSize: 13,
    padding: 15,
    color: '#999'
  },
  sectionTitle: {
    padding: 15,
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.FONT_BODY_COLOR,
    backgroundColor: theme.TITLE_BACKGROUND_COLOR
  },
  sectionItemsContainer: {
    paddingLeft: 15,
    paddingRight: 15,
  },
  sectionItemTextStyle: { color: theme.FONT_BODY_COLOR },
  sectionItemContainerStyle: { backgroundColor: 'transparent' }
});

export default Preferences;
