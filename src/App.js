/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React from 'react';
import codePush from 'react-native-code-push';
import { ThemeProvider } from 'styled-components/native';

import theme from './config/theme';
import NavigationStack from './containers/NavigationStack';

const App = () => (
  <ThemeProvider theme={theme}>
    <NavigationStack />
  </ThemeProvider>
);

export default codePush(App);
