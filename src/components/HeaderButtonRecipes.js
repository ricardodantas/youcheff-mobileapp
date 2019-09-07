import React from 'react';
import { Icon } from 'react-native-elements';

import theme from '../config/theme';

const HeaderButtonRecipes = props => (
  <Icon
    name="knife"
    type="material-community"
    reverseColor={theme.HEADER_BACKGROUND_COLOR}
    underlayColor={theme.HEADER_BACKGROUND_COLOR}
    color={theme.HEADER_FONT_COLOR}
    containerStyle={{ marginRight: theme.HEADER_MARGIN_RIGHT }}
    onPress={() => props.navigation.navigate('Recipes', {})}
  />
);


export default HeaderButtonRecipes;
