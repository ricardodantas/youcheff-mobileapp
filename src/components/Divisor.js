import React from 'react';
import { View } from 'react-native';
// import { Icon } from 'react-native-elements';

import theme from '../config/theme';

const Divider = ({
  height = 0.5,
  backgroundColor = theme.BORDER_COLOR,
  marginTop = 20,
  marginBottom = 20
}) => {
  const styles = {
    backgroundColor,
    height,
    marginTop,
    marginBottom
  };
  return (<View style={styles} />);
};


export default Divider;
