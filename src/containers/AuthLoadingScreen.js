import React, { Component } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  View
} from 'react-native';

import theme from '../config/theme';
import db from '../lib/db';

export default class AuthLoadingScreen extends Component {
  constructor(props) {
    super(props);
    this.bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  async bootstrapAsync() {
    const { navigation } = this.props;
    const user = await db.getAuthUser();
    navigation.navigate(user ? 'App' : 'Auth');
  }

  // Render any loading content that you like here
  render() {
    return (
      <View>
        <StatusBar backgroundColor={theme.HEADER_BACKGROUND_COLOR} barStyle="light-content" />
        <ActivityIndicator />
      </View>
    );
  }
}
