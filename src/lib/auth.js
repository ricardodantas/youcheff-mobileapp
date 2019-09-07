import { GoogleSignin } from 'react-native-google-signin';
import { AccessToken, LoginManager } from 'react-native-fbsdk';
import firebase from 'react-native-firebase';

import logging from './logging';

export async function emailAndPasswordSignIn({ email, password }) {
  try {
    const result = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    return result;
  } catch (error) {
    logging({ entry: error });
    return { error };
  }
}

export async function emailAndPasswordSignUp({ email, password }) {
  try {
    const result = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);
    return result;
  } catch (error) {
    logging({ entry: error });
    return { error };
  }
}

export async function emailAndPasswordSignInOrSignUp({ email, password }) {
  let result = await emailAndPasswordSignIn({ email, password });
  if (result.error) {
    result = await emailAndPasswordSignUp({ email, password });
  }
  return result;
}

// Calling this function will open Google for login.
export async function googleLogin() {
  try {
    // add any configuration settings here:
    await GoogleSignin.configure();

    const data = await GoogleSignin.signIn();

    // create a new firebase credential with the token
    const credential = firebase.auth.GoogleAuthProvider.credential(
      data.idToken,
      data.accessToken
    );

    // login with credential
    const firebaseUserCredential = await firebase
      .auth()
      .signInWithCredential(credential);

    // console.warn(JSON.stringify(firebaseUserCredential.user.toJSON()));
    return firebaseUserCredential.user.toJSON();
  } catch (error) {
    logging({ entry: error });
    return { error };
  }
}

// Calling the following function will open the FB login dialogue:
export async function facebookLogin() {
  try {
    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email'
    ]);

    if (result.isCancelled) {
      // handle this however suites the flow of your app
      throw new Error('User cancelled request');
    }

    // console.warn(
    //   `Login success with permissions: ${result.grantedPermissions.toString()}`
    // );

    // get the access token
    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      // handle this however suites the flow of your app
      throw new Error('Something went wrong obtaining the users access token');
    }

    // create a new firebase credential with the token
    const credential = firebase.auth.FacebookAuthProvider.credential(
      data.accessToken
    );

    // login with credential
    const firebaseUserCredential = await firebase
      .auth()
      .signInWithCredential(credential);

    // console.warn(JSON.stringify(firebaseUserCredential.user.toJSON()));
    return firebaseUserCredential.user.toJSON();
  } catch (error) {
    logging({ entry: error });
    return { error };
  }
}


export async function logout() {
  try {
    await firebase
      .auth()
      .signOut();
    return true;
  } catch (error) {
    logging({ entry: error });
    return { error };
  }
}
