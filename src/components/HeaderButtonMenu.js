import React from 'react';
import { Icon } from 'react-native-elements';

import theme from '../config/theme';

const HeaderButtonMenu = props => (
  <Icon
    name="menu"
    type="material-community"
    reverseColor={theme.HEADER_BACKGROUND_COLOR}
    underlayColor={theme.HEADER_BACKGROUND_COLOR}
    color={theme.HEADER_FONT_COLOR}
    containerStyle={{ marginLeft: theme.HEADER_MARGIN_LEFT }}
    onPress={() => props.navigation.navigate('Menu', {})}
  />
);


export default HeaderButtonMenu;
