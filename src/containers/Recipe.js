/* eslint-disable class-methods-use-this */
/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  View,
  Dimensions,
  Alert,
  FlatList,
  StatusBar
} from 'react-native';
import {
  Image, Text, Icon, Button, Tooltip, Overlay
} from 'react-native-elements';
import Carousel, { Pagination } from 'react-native-snap-carousel';

import commonStyles from '../common/styles';
import theme from '../config/theme';
import settings from '../config/settings';

import db from '../lib/db';
import logging from '../lib/logging';


type Props = {};

class Recipe extends Component<Props> {
  static navigationOptions({ navigation }) {
    const user = navigation.getParam('user', null);
    const recipe = navigation.getParam('recipe', null);
    const recipeMealDescription = navigation.getParam('recipeMealDescription', null);
    const isFavorited = navigation.getParam('isFavorited', false);
    return {
      title: recipeMealDescription,
      headerLeft: !recipe || !user ? null : (
        <Icon
          name={isFavorited ? 'heart' : 'heart-outline'}
          type="material-community"
          reverseColor={theme.HEADER_BACKGROUND_COLOR}
          underlayColor={theme.HEADER_BACKGROUND_COLOR}
          color={theme.HEADER_FONT_COLOR}
          containerStyle={{ marginLeft: theme.HEADER_MARGIN_LEFT }}
          onPress={() => {
            navigation.setParams({ isFavorited: !isFavorited });
            return db.favorite.toggle({ userId: user.uid, recipe }).then(currentStatus => navigation.setParams({ isFavorited: currentStatus }));
          }}
        />
      ),
      headerRight: (
        <Icon
          name="close"
          type="material-community"
          reverseColor={theme.HEADER_BACKGROUND_COLOR}
          underlayColor={theme.HEADER_BACKGROUND_COLOR}
          color={theme.HEADER_FONT_COLOR}
          containerStyle={{ marginRight: theme.HEADER_MARGIN_RIGHT }}
          onPress={() => navigation.pop()}
        />
      )

    };
  }

  constructor(props) {
    super(props);

    this.state = {
      user: null,
      showPhoto: false,
      recipe: null,
      activeSlide: 0,
      steps: []
    };
  }

  async componentDidMount() {
    try {
      const user = await db.getAuthUser();
      const { navigation } = this.props;
      const recipe = navigation.getParam('recipe', null);
      if (!recipe) {
        throw new Error('Recipe not found.');
      }
      const isFavorited = await db.favorite.getStatus({
        userId: user.uid,
        recipeId: recipe.info.id
      });
      await navigation.setParams({
        isFavorited,
        user,
        recipeMealDescription: `${settings.MEAL_TYPE[recipe.slot]}`
      });

      const steps = [];
      recipe.info.analyzedInstructions.map(item => steps.push(...item.steps));
      this.setState({
        user,
        recipe,
        steps,
      });
    } catch (error) {
      logging({ user: this.state.user, entry: error });
      Alert.alert(error.message || settings.DEFAULT_ERROR_MESSAGE);
    }
  }

  // renderPagination() {
  //   const { steps, activeSlide } = this.state;
  //   return (
  //     <Pagination
  //       dotsLength={steps.length}
  //       activeDotIndex={activeSlide}
  //       containerStyle={{}}
  //       dotStyle={{
  //         width: 10,
  //         height: 10,
  //         borderRadius: 5,
  //         marginHorizontal: 8,
  //         backgroundColor: theme.DIVIDER_COLOR
  //       }}
  //       inactiveDotStyle={
  //         {
  //           // Define styles for inactive dots here
  //         }
  //       }
  //       inactiveDotOpacity={0.4}
  //       inactiveDotScale={0.6}
  //     />
  //   );
  // }

  addFinalStep() {}

  renderStep(step) {
    const { item } = step;
    const backgroundColor = item.number % 2 ? '#fff' : theme.CONTENT_BACKGROUND_COLOR;
    return (
      <View style={{ ...styles.slide, backgroundColor }} key={item.number}>
        <StatusBar backgroundColor={theme.HEADER_BACKGROUND_COLOR} barStyle="light-content" />
        <Text style={{
          ...styles.title,
          textAlign: 'left',
          backgroundColor: 'transparent',
          padding: 0,
          fontSize: 20
        }}
        >
          {`Step ${item.number}: `}

        </Text>
        <Text
          style={{
            fontSize: 18,
            color: theme.FONT_BODY_COLOR
          }}
        >
          {item.step}
        </Text>
      </View>
    );
  }

  renderCarousel() {
    const { steps } = this.state;
    return (
      <Carousel
        useScrollView
        ref={(c) => {
          this._carousel = c;
        }}
        data={steps}
        renderItem={this.renderStep}
        sliderWidth={Dimensions.get('window').width}
        itemWidth={Dimensions.get('window').width}
        onSnapToItem={index => this.setState({ activeSlide: index })}
      />
    );
  }

  renderIngredient(item) {
    const ingredient = item.item;
    return (
      <Text style={styles.ingredient}>
        {`• ${ingredient.name} (${ingredient.amount} ${ingredient.unit})`}
      </Text>
    );
  }

  renderIngredients() {
    const { recipe } = this.state;
    return (
      <View style={{ paddingTop: 15, paddingBottom: 15, backgroundColor: theme.CONTENT_BACKGROUND_COLOR }}>
        <FlatList
          ListHeaderComponent={<Text style={styles.ingredientsTitle}>Ingredients:</Text>}
          keyExtractor={(item, index) => `${index + 1}`}
          data={recipe.info.extendedIngredients}
          renderItem={this.renderIngredient}
        />
      </View>
    );
  }

  renderSteps() {
    const { steps } = this.state;
    return (
      <FlatList
        keyExtractor={(item, index) => `${index + 1}`}
        data={steps}
        renderItem={this.renderStep}
      />
    );
  }

  render() {
    // const { navigate } = this.props.navigation;
    const { recipe, showPhoto } = this.state;

    if (!recipe || !recipe.info) {
      return null;
    }

    const {
      title, image, readyInMinutes, servings, vegetarian, vegan
    } = recipe.info;
    const imageUrl = image;
    return (
      <ScrollView style={commonStyles.body}>

        {/* <Overlay
          fullScreen
          overlayStyle={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}
          isVisible={showPhoto}
        >
          <View style={{ width: '100%', height: 300 }}>
            <Image
              source={{
                uri: imageUrl,
                // cache: 'reload'
              }}
              style={{
                alignSelf: 'center',
                resizeMode: 'cover',
                width: '100%',
                marginTop: 0,
                marginBottom: 0
              }}
              PlaceholderContent={<ActivityIndicator size="large" />}
            />
            <Button title="Close" onPress={() => this.setState({ showPhoto: false })} />
          </View>
        </Overlay> */}

        {/* <TouchableOpacity activeOpacity={1} onPress={() => this.setState({ showPhoto: true })}> */}
        <Image
          resizeMethod="scale"
          source={{
            uri: imageUrl,
            // cache: 'reload'
          }}
          style={{
            alignSelf: 'center',
            resizeMode: 'cover',
            width: '160%',
            height: 200,
            marginTop: 0,
            marginBottom: 0
          }}
          PlaceholderContent={<ActivityIndicator size="large" />}
        />
        {/* </TouchableOpacity> */}

        <Text style={{ ...styles.title, marginBottom: 0 }}>
          {title}
        </Text>
        <View style={{
          marginBottom: 15, justifyContent: 'center', alignItems: 'center', flexDirection: 'row'
        }}
        >

          <Tooltip withOverlay={false} backgroundColor={theme.FONT_BODY_COLOR} popover={<Text style={{ color: theme.MAIN_BACKGROUND_COLOR }}>Preparation time</Text>}>
            <Button
              disabled
              disabledTitleStyle={{ color: theme.FONT_BODY_COLOR, fontSize: 16 }}
            // containerStyle={{ marginLeft: 15 }}
              type="clear"
              icon={(
                <Icon type="font-awesome" name="clock-o" size={16} containerStyle={{ marginRight: 5 }} />
            )}
              title={`${readyInMinutes} min.`}
            />
          </Tooltip>

          <Button
            disabled
            disabledTitleStyle={{ color: theme.FONT_BODY_COLOR, fontSize: 16 }}
            // containerStyle={{ marginLeft: 15 }}
            type="clear"
            icon={(
              <Icon type="font-awesome" name="user" size={16} containerStyle={{ marginRight: 5 }} />
            )}
            title={`${servings} servings`}
          />
          {
            (vegetarian || vegan) ? (
              <Button
                disabled
                disabledTitleStyle={{ color: theme.FONT_BODY_COLOR, fontSize: 16 }}
                // containerStyle={{ marginLeft: 15 }}
                type="clear"
                icon={(
                  <Icon type="font-awesome" name="leaf" size={16} containerStyle={{ marginRight: 5 }} />
                )}
                title={`${vegan ? 'vegan' : `${vegetarian ? 'vegetarian' : ''}`}`}
              />
            ) : null
          }
        </View>
        {this.renderIngredients()}
        {this.renderSteps()}
        {/*
        <View
          style={{
            width: '100%',
            backgroundColor: theme.MAIN_BACKGROUND_COLOR,
            height: 400
          }}
        >
          {this.renderCarousel()}
          {this.renderPagination()}
        </View>
        */}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  instructionsTitle: {
    padding: 15,
    fontSize: 15,
    fontWeight: 'bold',
  },
  slide: {
    // width: '100%',
    // height: '100',
    minHeight: 200,
    padding: 15,
    marginBottom: 30,
    backgroundColor: 'white'
  },
  title: {
    textAlign: 'center',
    width: '100%',
    fontWeight: 'bold',
    color: theme.TITLE_COLOR,
    // backgroundColor: theme.TITLE_BACKGROUND_COLOR,
    fontSize: 20,
    marginLeft: 0,
    padding: 15,
    marginBottom: 15
  },
  ingredientsTitle: {
    paddingLeft: 15,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20
  },
  ingredient: {
    color: theme.FONT_BODY_COLOR,
    paddingLeft: 15,
    marginBottom: 10
    // fontStyle: 'italic',
    // marginRight: 20
  }
});

export default Recipe;
