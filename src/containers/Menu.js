/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import { StyleSheet, Alert, View } from 'react-native';
import { Icon, ListItem } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import * as RNIap from 'react-native-iap';

import theme from '../config/theme';
import settings from '../config/settings';

// import commonStyles from '../common/styles';

import Divider from '../components/Divisor';
import packageInfo from '../../package-lock.json';

import { logout } from '../lib/auth';
import db from '../lib/db';
import logging from '../lib/logging';
import { subscribeTopic, unsubscribeTopic } from '../lib/pushNotification';

class Menu extends Component<Props> {
  static navigationOptions = ({ navigation }) => ({
    title: 'Menu',
    headerLeft: null,
    headerRight: (
      <Icon
        name="close"
        type="material-community"
        reverseColor={theme.HEADER_BACKGROUND_COLOR}
        underlayColor={theme.HEADER_BACKGROUND_COLOR}
        color={theme.HEADER_FONT_COLOR}
        containerStyle={{ marginRight: theme.HEADER_MARGIN_RIGHT }}
        onPress={() => navigation.navigate('Recipes', {})}
      />
    )

  });

  constructor(props) {
    super(props);
    this.state = {
      appSettings: null,
      user: null
    };
    this.doLogout = this.doLogout.bind(this);

    // this.toggleNotifications = this.toggleNotifications.bind(this);
  }

  async componentDidMount() {
    const user = await db.getAuthUser();
    const appSettings = await db.getAppSettings();
    this.setState({
      user,
      appSettings
    });
  }


  async doLogout() {
    const { navigation } = this.props;
    Alert.alert(settings.LOGOUT_MESSAGE, '', [{
      text: 'Logout',
      onPress: async () => {
        await AsyncStorage.clear();
        await logout();
        navigation.navigate('Login', { });
      }
    },
    {
      text: 'Cancel',
      style: 'cancel',
    }
    ], { cancelable: true });
  }

  async toggleNotifications(value) {
    const appSettings = await db.getAppSettings();
    const enableNotifications = value;
    if (enableNotifications) {
      await subscribeTopic();
    } else {
      await unsubscribeTopic();
    }
    const newAppSettings = { ...appSettings, enableNotifications };
    await db.storeAppSettings(newAppSettings);
    this.setState({ appSettings: newAppSettings });
  }

  getNotificationSettingsValue() {
    const { appSettings } = this.state;
    if (!appSettings) {
      return false;
    }
    const { enableNotifications } = appSettings;
    if (enableNotifications === undefined) {
      return false;
    }
    return enableNotifications;
  }

  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.menuView}>
        <ListItem
          containerStyle={styles.listItemContainer}
          titleStyle={styles.menuFontStyle}
          title="Preferences"
          leftIcon={{ type: 'octicons', name: 'settings', color: theme.MENU_FONT_COLOR }}
          onPress={() => navigation.navigate('Preferences', { isPreviousMenu: true })}
        />
        <ListItem
          containerStyle={styles.listItemContainer}
          titleStyle={styles.menuFontStyle}
          title="Saved Recipes"
          leftIcon={{ type: 'material-community', name: 'heart', color: theme.MENU_FONT_COLOR }}
          onPress={() => navigation.navigate('SavedRecipes', { isPreviousMenu: true })}
        />
        <ListItem
          containerStyle={styles.listItemContainer}
          titleStyle={styles.menuFontStyle}
          title="Notifications"
          switch={{
            value: this.getNotificationSettingsValue(),
            onValueChange: value => this.toggleNotifications(value)
          }}
          leftIcon={{ type: 'material-community', name: 'bell', color: theme.MENU_FONT_COLOR }}
        />
        <Divider marginTop={5} marginBottom={5} />
        <ListItem
          containerStyle={styles.listItemContainer}
          titleStyle={styles.menuFontStyle}
          title="Logout"
          leftIcon={{ type: 'material-community', name: 'logout', color: theme.MENU_FONT_COLOR }}
          onPress={() => this.doLogout()}
        />
        <Divider marginTop={5} marginBottom={5} />
        <ListItem
          disabled
          containerStyle={styles.listItemContainer}
          titleStyle={styles.menuVersionFontStyle}
          title={`Version: ${packageInfo.version}`}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  menuView: {
    backgroundColor: theme.MENU_BACKGROUND_COLOR,
    height: '100%'
  },
  menuFontStyle: {
    color: theme.MENU_FONT_COLOR
  },
  menuVersionFontStyle: {
    fontSize: 12,
    color: theme.MENU_FONT_COLOR
  },
  listItemContainer: {
    backgroundColor: theme.MENU_BACKGROUND_COLOR
  }
});

export default Menu;
