import React from 'react';
import {
  ActivityIndicator, View, TouchableOpacity
} from 'react-native';
import {
  Text, Image, Tooltip, Button, Icon
} from 'react-native-elements';

import theme from '../config/theme';
import settings from '../config/settings';

const RecipeItem = (props) => {
  const {
    id, day, info, slot, handleClick
  } = props;
  const { title, readyInMinutes } = info;

  return (
    <TouchableOpacity style={{ marginBottom: 50 }} activeOpacity={1} onPress={() => handleClick()}>
      <View
        containerStyle={{
          backgroundColor: 'transparent',
          width: '100%'
        }}
      >

        <View style={{
          margin: 0,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row'
        }}
        >
          <Text style={{
            textAlign: 'left',
            paddingLeft: 15,
            fontWeight: 'bold',
            fontSize: 18,
            color: theme.FONT_COLOR
          }}
          >
            {settings.MEAL_TYPE[slot]}
          </Text>

          <Tooltip withOverlay={false} backgroundColor={theme.FONT_BODY_COLOR} popover={<Text style={{ color: theme.MAIN_BACKGROUND_COLOR }}>Preparation time</Text>}>
            <Button
              disabled
              disabledTitleStyle={{ color: theme.TIME_FONT_COLOR, fontSize: 14 }}
              type="clear"
              icon={(
                <Icon type="font-awesome" color={theme.TIME_FONT_COLOR} name="clock-o" size={15} containerStyle={{ marginRight: 5 }} />
            )}
              title={`${readyInMinutes} min.`}
            />
          </Tooltip>
        </View>


        <Image
          source={{
            uri: info.image,
            // cache: 'only-if-cached'
          }}
          resizeMethod="scale"
          style={{
            alignSelf: 'center',
            resizeMode: 'cover',
            width: '160%',
            height: 200,
            marginTop: 15,
            marginBottom: 15
          }}
          PlaceholderContent={<ActivityIndicator size="large" />}
        />
        <Text style={{
          color: theme.FONT_BODY_COLOR, paddingLeft: 15, textAlign: 'left', fontSize: 18
        }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default RecipeItem;
