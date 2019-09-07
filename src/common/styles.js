import { Platform, StyleSheet } from 'react-native';
import theme from '../config/theme';

const styles = StyleSheet.create({
  menuView: {
    backgroundColor: theme.MAIN_BACKGROUND_COLOR,
    height: '100%'
  },
  menuFontStyle: {
    color: theme.MENU_FONT_COLOR
  },
  menuVersionFontStyle: {
    color: theme.MENU_FONT_COLOR
  },
  scrollView: {
    backgroundColor: theme.MAIN_BACKGROUND_COLOR,
  },
  scrollViewList: {
    backgroundColor: theme.MAIN_BACKGROUND_COLOR,
    paddingTop: 20,
  },
  body: {
    backgroundColor: theme.MAIN_BACKGROUND_COLOR,
  },
  buttonOkText: {
    color: theme.BUTTON_OK_FONT_COLOR,
  },
  buttonOkContainer: {
    margin: 10,
    backgroundColor: theme.BUTTON_OK_BACKGROUND_COLOR,
  },
  input: {
    color: theme.INPUT_FONT_COLOR,
    marginLeft: 10,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: theme.INPUT_BORDER_COLOR,
    borderRadius: 8,
    backgroundColor: theme.INPUT_BACKGROUND_COLOR,
    marginTop: 10,
    marginBottom: 10,
  },
  block: {
    width: '90%',
    borderRadius: 10,
    padding: 5,
    // backgroundColor: theme.CONTENT_BACKGROUND_COLOR,
    marginBottom: 10,
  },
  title: {
    color: theme.TITLE_COLOR,
  },
});

export default styles;
