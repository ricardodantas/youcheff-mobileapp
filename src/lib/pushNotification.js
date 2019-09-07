import firebase from 'react-native-firebase';
import settings from '../config/settings';
import db from './db';

export const subscribeTopic = () => firebase.messaging()
  .subscribeToTopic(settings.PUSH_NOTIFICATION.TOPIC_GENERAL);

export const unsubscribeTopic = () => firebase.messaging()
  .unsubscribeFromTopic(settings.PUSH_NOTIFICATION.TOPIC_GENERAL);

export const requestPermission = async () => {
  try {
    await firebase.messaging().requestPermission();
    const appSettings = await db.getAppSettings();
    await db.storeAppSettings({ ...appSettings, enableNotifications: true });
  } catch (error) {
    return { error };
  }
};

export const onMessage = async (callback) => {
  const enabled = await firebase.messaging().hasPermission();
  if (!enabled) {
    await requestPermission();
    await subscribeTopic();
  }
  return firebase.messaging().onMessage(callback);
};


export const onNotificationOpened = async callback => firebase.notifications()
  .onNotificationOpened((notificationOpen) => {
  // Get the action triggered by the notification being opened
    // const { action } = notificationOpen;
    // Get information about the notification that was opened
    const { notification } = notificationOpen;
    callback(notification);
  });
