import React from 'react';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '../config/theme';

const ButtonSignIn = (props) => {
  const { type, onClick } = props;

  const handleClick = (e) => {
    e.preventDefault();
    onClick();
  };

  let settings = {};

  switch (type) {
    case 'google':
      settings = {
        marginTop: 0,
        icon: 'google',
        label: 'Sign in with Google',
        backgroundColor: theme.GOOGLE_BLUE_COLOR
      };
      break;
    case 'facebook':
      settings = {
        icon: 'facebook',
        label: 'Sign in with Facebook',
        backgroundColor: theme.FACEBOOK_BLUE_COLOR
      };
      break;
    default:
      settings = {
        // icon: 'envelope',
        type: 'clear',
        label: 'Sign up with email/password',
        backgroundColor: theme.LOGIN_FONT_COLOR
      };
  }

  return (
    <Button
      type={settings.type || null}
      title={settings.label}
      icon={settings.icon ? <Icon name={settings.icon} size={18} color="white" /> : null}
      buttonStyle={{
        alignSelf: 'center',
        width: '90%',
        marginTop: settings.marginTop || 20,
        backgroundColor: settings.type === 'clear' ? null : settings.backgroundColor,
      }}
      titleStyle={{ color: theme.BUTTON_OK_FONT_COLOR, marginLeft: 10 }}
      onPress={handleClick}
    />
  );
};

// const styles = StyleSheet.create({});

export default ButtonSignIn;
