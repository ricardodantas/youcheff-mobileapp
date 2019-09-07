import firebase from 'react-native-firebase';
// import AppError from './appError';

if (__DEV__) {
  firebase.config().enableDeveloperMode();
}

function getRemoteConfig(key) {
  return firebase.config().fetch(0)
    .then(() => firebase.config().activateFetched())
    .then((activated) => {
      if (!activated) Promise.reject('Fetched data not activated');
      return firebase.config().getValue(key);
    })
    .then(snapshot => snapshot.val());
}

export default getRemoteConfig;
