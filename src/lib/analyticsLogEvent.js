import firebase from 'react-native-firebase';

const analytics = firebase.analytics();

const logEvent = ({
  userId = null, screenName, event, data = null
}) => {
  if (userId) analytics.setUserId(userId);
  analytics.setCurrentScreen(screenName);
  if (data) {
    analytics.logEvent(event, data);
  } else {
    analytics.logEvent(event);
  }
};

export default logEvent;
