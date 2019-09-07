import React, { Component } from 'react';
import {
  Platform, Text, ActivityIndicator, StyleSheet, View
} from 'react-native';
import { Overlay } from 'react-native-elements';
import theme from '../config/theme';

const Loading = (props) => {
  const {
    show, label, fullscreen, onlySpinner, color
  } = props;

  if (onlySpinner && show) {
    return (<ActivityIndicator size="large" color={color || theme.LOADING_COLOR} />);
  }

  return (
    <Overlay
      isVisible={show}
      overlayStyle={{
        justifyContent: 'center',
        backgroundColor: theme.LOADING_BACKGROUND_COLOR,
        borderRadius: fullscreen ? null : 10,
        height: fullscreen ? '100%' : 150,
        width: fullscreen ? '100%' : 250
      }}
    >

      <View>
        <ActivityIndicator size="large" color={theme.LOADING_COLOR} />
        {label ? (
          <Text style={{
            textAlign: 'center', marginTop: 20, color: theme.LOADING_COLOR, fontSize: 19
          }}
          >
            {label}
          </Text>
        ) : null}
      </View>
    </Overlay>
  );
};

export default Loading;
