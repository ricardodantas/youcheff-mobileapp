/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/sort-comp */
/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import {
  Platform, StyleSheet, ScrollView, Alert, StatusBar
} from 'react-native';
import {
  PricingCard, Text, Icon, Button
} from 'react-native-elements';
import * as RNIap from 'react-native-iap';

import Loading from '../components/Loading';

import theme from '../config/theme';
import settings from '../config/settings';

import commonStyles from '../common/styles';
import db from '../lib/db';
import logging from '../lib/logging';
import analyticsLogEvent from '../lib/analyticsLogEvent';


const itemSkus = Platform.select({
  ios: [
    'app.youcheff.annualsubscription',
    'app.youcheff.monthlysubscription'
  ],
  android: [
    'app.youcheff'
  ]
});

export default class Subscribe extends Component<Props> {
  static navigationOptions({ navigation }) {
    const trialFinished = navigation.getParam('trialFinished', false);
    const isPreviousMenu = navigation.getParam('isPreviousMenu', false);
    const navigateTo = isPreviousMenu ? 'Menu' : 'Recipes';
    return {
      // header: null,
      title: null,
      headerLeft: null,
      headerRight: trialFinished ? null : (
        <Icon
          name="close"
          type="material-community"
          reverseColor={theme.SUBSCRIPTION_BACKGROUND_COLOR}
          underlayColor={theme.SUBSCRIPTION_BACKGROUND_COLOR}
          color={theme.SUBSCRIPTION_FONT_COLOR}
          containerStyle={{ marginRight: theme.HEADER_MARGIN_RIGHT }}
          onPress={() => navigation.navigate(navigateTo, {})
          }
        />
      ),
      headerStyle: {
        backgroundColor: theme.SUBSCRIPTION_BACKGROUND_COLOR,
        borderBottomWidth: 0
      },
      headerTitleStyle: {
        color: theme.SUBSCRIPTION_FONT_COLOR
      }
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      products: [],
      subscriptionInfo: null,
      user: null
    };
    this.restoreSubscription = this.restoreSubscription.bind(this);
  }

  async restoreSubscription() {
    const { user } = this.state;
    const { navigation } = this.props;
    try {
      const purchases = await RNIap.getAvailablePurchases();
      if (purchases.length) {
        await db.storeUserSubscription({ subscriptionInfo: purchases, userId: user.uid });
        analyticsLogEvent({
          userId: user.uid,
          screenName: 'Subscription',
          event: 'purchases_restored'
        });

        Alert.alert('Restore Successful', 'You successfully restored your subscription!', [{
          text: 'OK',
          onPress: () => navigation.navigate('Recipes')
        }], { cancelable: false });
      }
    } catch (error) {
      logging({ user, entry: error });
      Alert.alert(error.message);
    }
  }

  async componentDidMount() {
    let user = null;
    try {
      const { navigation } = this.props;
      user = await db.getAuthUser();
      const subscriptionInfo = await db.getUserSubscription({ userId: user.uid });
      if (subscriptionInfo) {
        navigation.navigate('Recipes');
      } else {
        await RNIap.initConnection();
        const products = await RNIap.getProducts(itemSkus);
        this.setState({ user, subscriptionInfo, products: products.reverse() });
      }
    } catch (error) {
      logging({ user, entry: error });
      Alert.alert('Ops..', error.message || settings.DEFAULT_ERROR_MESSAGE, [{ text: 'OK' }], { cancelable: false });
    }
  }

  async componentWillUnmount() {
    await RNIap.endConnectionAndroid();
  }

  async buySubscription(sku, _) {
    const { user } = _.state;
    try {
      const purchase = await RNIap.requestSubscription(sku);
      this.setState({ subscriptionInfo: purchase });
      await db.storeUserSubscription({ subscriptionInfo: purchase, userId: user.uid });
      analyticsLogEvent({
        userId: user.uid,
        screenName: 'Subscription',
        event: 'subscription_done',
        // data: purchase
      });
      Alert.alert(
        'Thank you! Your subscription was successfully activated!',
        '',
        [{ text: 'OK', onPress: () => _.props.navigation.navigate('Recipes') }], { cancelable: false }
      );
    } catch (error) {
      logging({ user, entry: error });
      Alert.alert('Ops..', error.message || settings.DEFAULT_ERROR_MESSAGE, [{ text: 'OK' }], { cancelable: false });
    }
  }

  renderPlan(plan, index, _) {
    // const { subscriptionPeriodUnitIOS, subscriptionPeriodAndroid } = plan;
    // const isPeriodYear = Platform.select({
    //   ios: subscriptionPeriodUnitIOS === 'YEAR',
    //   android: subscriptionPeriodAndroid === 'P1Y'
    // });
    return (
      <Button
        key={index}
        raised
        containerStyle={{
          margin: 20,
          marginTop: 30,
          marginBottom: 5,

        }}
        titleStyle={{ color: theme.SUBSCRIPTION_BUTTON_FONT_COLOR }}
        buttonStyle={{ padding: 20, backgroundColor: theme.SUBSCRIPTION_BUTTON_BACKGROUND_COLOR }}
        onPress={() => _.buySubscription(plan.productId, _)}
        title={`${plan.localizedPrice} / ${plan.title}`}
      />
    );
    // return (
    //   <PricingCard
    //     key={index}
    //     color={!index ? theme.BUTTON_BACKGROUND_COLOR : theme.BUTTON_OK_BACKGROUND_COLOR}
    //     title={plan.title}
    //     price={plan.localizedPrice}
    //     info={isPeriodYear ? ['20% off', '7 days trial'] : ['7 days trial']}
    //     button={{ title: 'SUBSCRIBE' }}
    //     onButtonPress={() => _.buySubscription(plan.productId)}
    //   />
    // );
  }

  render() {
    const { products } = this.state;
    return (
      <ScrollView style={styles.body}>
        <StatusBar backgroundColor={theme.HEADER_FONT_COLOR} barStyle="dark-content" />
        <Loading fullscreen show={products.length === 0} />
        <Text style={styles.title}>Our subscription plans</Text>
        <Text style={{
          margin: 20,
          textAlign: 'center',
          color: theme.SUBSCRIPTION_FONT_COLOR
        }}
        >
Find your perfect meal, get full access to all suggested recipes.

        </Text>
        {products.map((plan, index) => this.renderPlan(plan, index, this))}
        <Text style={{ textAlign: 'center' }}>(Save 30%)</Text>
        <Button
          style={{ marginTop: 30, marginBottom: 20, color: theme.SUBSCRIPTION_BUTTON_FONT_COLOR }}
          title="Restore Purchases"
          titleStyle={{ color: theme.SUBSCRIPTION_BUTTON_BACKGROUND_COLOR }}
          type="clear"
          onPress={() => this.restoreSubscription()}
        />
        <Text style={{
          margin: 20,
          textAlign: 'justify',
          fontSize: 11,
          color: theme.SUBSCRIPTION_FONT_COLOR
        }}
        >
Payment will be charged to your Apple ID account at the confirmation of purchase. Subscription automatically renews unless it is canceled at least 24 hours before the end of the current period. Your account will be charged for renew within 24 hours prior to the end of the current period. You can manage and cancel your subscriptions by going to your account settings on the App Store after purchase.

        </Text>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: theme.SUBSCRIPTION_BACKGROUND_COLOR
  },
  title: {
    // marginTop: 50,
    marginBottom: 15,
    padding: 15,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: theme.SUBSCRIPTION_FONT_COLOR,
  },
});
