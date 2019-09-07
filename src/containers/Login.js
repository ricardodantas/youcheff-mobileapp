import React, { Component } from 'react';
import { View, Alert, StatusBar } from 'react-native';
import { Input, Image } from 'react-native-elements';

import theme from '../config/theme';
import styles from '../common/styles';

import ButtonSignIn from '../components/ButtonSignIn';
import Loading from '../components/Loading';
import Divider from '../components/Divisor';

import {
  googleLogin,
  facebookLogin,
  emailAndPasswordSignInOrSignUp
} from '../lib/auth';
import db from '../lib/db';
import logging from '../lib/logging';
import AppError from '../lib/appError';
import settings from '../config/settings';

type Props = {};

class Login extends Component<Props> {
  static navigationOptions = {
    title: 'Home',
    header: null
  };

  constructor(props) {
    super(props);
    this.state = { email: null, password: null, showLoading: false };
    this.login = this.login.bind(this);
  }

  // async componentDidMount() {
  //   try {
  //     await this.authenticateSession();
  //   } catch (error) {
  //     logging({ entry: error });
  //   }
  // }

  async login(type) {
    const { email, password } = this.state;
    let user;
    try {
      this.setState({ showLoading: true });
      switch (type) {
        case 'google':
          user = await googleLogin();
          break;
        case 'facebook':
          user = await facebookLogin();
          break;
        default:
          if (!email || !email) { throw new AppError('Type a valid email and password.'); }
          user = await emailAndPasswordSignInOrSignUp({ email, password });
      }

      if (user && !user.error) {
        await db.storeAuthUser(user);
        await this.authenticateSession();
      } else if (user.error) {
        throw new AppError(user.error);
      }
    } catch (error) {
      if (!(error instanceof AppError)) {
        logging({
          user: {
            id: '',
            email
          },
          entry: error
        });
      }
      this.setState({ showLoading: false }, () => {
        if (error.message.toLowerCase() !== 'error: user cancelled request') {
          Alert.alert(error.message || settings.DEFAULT_ERROR_MESSAGE);
        }
      });
    }
  }

  async authenticateSession() {
    try {
      const { navigation } = this.props;
      const user = await db.getAuthUser();
      if (user) {
        const userPreferences = await db.getUserPreferences({ userId: user.uid });
        if (!userPreferences) {
          navigation.navigate('Preferences');
        } else {
          navigation.navigate('Recipes');
        }
      }
    } catch (error) {
      logging({ entry: error });
      Alert.alert('Auth Session', error.message || settings.DEFAULT_ERROR_MESSAGE, [{ text: 'OK' }], { cancelable: false });
    }
  }

  renderForm() {
    const { email, password } = this.state;
    return (
      <View style={styles.block}>
        <Input
          autoCorrect={false}
          autoCapitalize="none"
          autoCompleteType="off"
          textContentType="username"
          placeholder="email"
          keyboardType="email-address"
          shake
          inputStyle={styles.input}
          inputContainerStyle={styles.inputContainer}
          leftIcon={{
            type: 'font-awesome',
            name: 'envelope',
            color: theme.INPUT_ICON_COLOR
          }}
          onChangeText={inputEmail => this.setState({ email: inputEmail })}
          value={email}
        />
        <Input
          secureTextEntry
          autoCapitalize="none"
          autoCompleteType="off"
          autoCorrect={false}
          textContentType="password"
          placeholder="password"
          shake
          inputStyle={styles.input}
          inputContainerStyle={styles.inputContainer}
          leftIcon={{
            type: 'font-awesome',
            name: 'lock',
            color: theme.INPUT_ICON_COLOR
          }}
          onChangeText={inputPassword => this.setState({ password: inputPassword })}
          value={password}
        />
        <ButtonSignIn type="email" onClick={() => this.login('email')} />
        <Divider backgroundColor={theme.LOGIN_FONT_COLOR} />
        <ButtonSignIn type="google" onClick={() => this.login('google')} />
        <ButtonSignIn
          type="facebook"
          onClick={() => this.login('facebook')}
        />
      </View>
    );
  }

  render() {
    const { showLoading } = this.state;

    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.LOGIN_BACKGROUND_COLOR
      }}
      >
        <StatusBar backgroundColor={theme.HEADER_BACKGROUND_COLOR} barStyle="light-content" />
        <Image
          placeholderStyle={{ backgroundColor: 'transparent' }}
          style={{
            alignSelf: 'center',
            width: 250,
            height: 250,
            resizeMode: 'cover',
            marginBottom: 30
          }}
          source={require('../images/logo.png')}
        />
        {showLoading ? <View style={{ marginTop: 30 }}><Loading show={showLoading} color={theme.LOGIN_LOADING_COLOR} onlySpinner /></View> : this.renderForm()}
      </View>
    );
  }
}

export default Login;
