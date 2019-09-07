import AsyncStorage from '@react-native-community/async-storage';
import firebase from 'react-native-firebase';
import moment from 'moment';

const db = firebase.firestore();

export default {
  storeFirstTimeRun: ({ userId }) => {
    if (!userId) return Promise.resolve(false);
    const ref = db.collection('first_time_run_app').doc(userId);

    return ref.get().then((doc) => {
      const date = moment().format('YYYY-MM-DD');
      if (doc.exists) {
        const docData = doc.data();
        if (date) return docData.date;
      }
      return ref.set({
        userId,
        date
      }).then(() => date);
    });
  },
  getAppSettings: () => AsyncStorage.getItem('@app:settings').then((appSettings) => {
    if (appSettings) {
      return JSON.parse(appSettings);
    }
    return {};
  }),
  storeAppSettings: appSettings => AsyncStorage.setItem('@app:settings', JSON.stringify(appSettings)),
  getAuthUser: () => AsyncStorage.getItem('@auth:user').then((user) => {
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser && parsedUser.user) {
        return parsedUser.user;
      }
      return parsedUser;
    }
    return null;
  }),
  storeAuthUser: user => AsyncStorage.setItem('@auth:user', JSON.stringify(user)),
  getShoppingList: () => AsyncStorage.getItem('@shopping:list:statuses').then(list => JSON.parse(list)),
  storeShoppingList: list => AsyncStorage.setItem('@shopping:list:statuses', JSON.stringify(list)),
  getRecipes: ({ userId }) => {
    if (!userId) return Promise.resolve(null);
    return AsyncStorage.getItem('@recipes').then((recipes) => {
      if (recipes) {
        const parsedRecipes = JSON.parse(recipes);
        if (parsedRecipes.length > 0) return parsedRecipes;
      }
      const ref = db.collection('recipes').doc(userId);
      return ref.get().then((doc) => {
        if (doc.exists) {
          const { items } = doc.data();
          if (items) return JSON.parse(items);
        }
        return null;
      });
    });
  },
  storeRecipes: ({ recipes, userId }) => {
    if (!userId || !recipes) return Promise.resolve(false);
    return AsyncStorage.setItem('@recipes', JSON.stringify(recipes)).then(() => {
      const ref = db.collection('recipes').doc(userId);
      return ref.set({
        userId,
        items: JSON.stringify(recipes)
      });
    });
  },
  getUserPreferences: ({ userId }) => {
    if (!userId) return Promise.resolve(null);
    return AsyncStorage.getItem('@userPreferences').then((userPreferences) => {
      if (userPreferences) {
        const parsedSettings = JSON.parse(userPreferences);
        if (typeof parsedSettings && Object.keys(parsedSettings).length) return parsedSettings;
      }

      const ref = db.collection('preferences').doc(userId);
      return ref.get().then((doc) => {
        if (doc.exists) {
          const { items } = doc.data();
          if (items) return JSON.parse(items);
        }
        return null;
      });
    });
  },
  storeUserPreferences: ({ preferences, userId }) => {
    if (!userId || !preferences) return Promise.resolve(false);
    return AsyncStorage.setItem('@userPreferences', JSON.stringify(preferences))
      .then(() => {
        const ref = db.collection('preferences').doc(userId);
        return ref.set({
          userId,
          items: JSON.stringify(preferences)
        });
      });
  },
  getUserSubscription: ({ userId }) => {
    if (!userId) return Promise.resolve(null);
    const ref = db.collection('subscriptions').doc(userId);
    return ref.get().then((doc) => {
      if (doc.exists) {
        const { info } = doc.data();
        if (info) return JSON.parse(info);
      }
      return null;
    });
    // AsyncStorage.getItem('@userPreferences').then(prefs => JSON.parse(prefs))
  },
  storeUserSubscription: ({ subscriptionInfo, userId }) => {
    if (!userId || !subscriptionInfo) return Promise.resolve(false);
    const ref = db.collection('subscriptions').doc(userId);
    return ref.set({
      userId,
      info: JSON.stringify(subscriptionInfo)
    });
    // AsyncStorage.setItem('@userPreferences', JSON.stringify(preferences))
  },
  favorite: {
    getAll: ({ userId }) => {
      if (!userId) return Promise.resolve([]);
      return AsyncStorage.getItem('@userFavorites').then((favorites) => {
        if (favorites) {
          const parsed = JSON.parse(favorites);
          if (Array.isArray(parsed) && parsed.length) {
            return parsed;
          }
        }
        const ref = db.collection('favorites').doc(userId);
        return ref.get().then((doc) => {
          if (doc.exists) {
            const { items } = doc.data();
            if (items) return JSON.parse(items);
          }
          return [];
        });
      });
    },
    getStatus: ({ userId, recipeId }) => {
      if (!userId || !recipeId) return Promise.resolve(false);
      return AsyncStorage.getItem('@userFavorites').then((favorites) => {
        if (favorites) {
          const parsedFavorites = JSON.parse(favorites);
          return parsedFavorites.some(item => item.info.id === recipeId);
        }
        const ref = db.collection('favorites').doc(userId);
        return ref.get().then((doc) => {
          if (doc.exists) {
            const { items } = doc.data();
            if (items) {
              const parsed = JSON.parse(items);
              if (Array.isArray(parsed)) {
                return parsed.some(item => item.info.id === recipeId);
              }
            }
          }
          return false;
        });
      });
    },
    toggle: ({ userId, recipe }) => {
      if (!userId || !recipe) return Promise.resolve(false);
      return AsyncStorage.getItem('@userFavorites').then((favorites) => {
        let parsedFavorites = [];
        if (favorites) {
          parsedFavorites = JSON.parse(favorites);
          const foundItem = parsedFavorites.findIndex(item => item.info.id === recipe.info.id);
          if (foundItem >= 0) {
            parsedFavorites.splice(foundItem, 1);
          } else {
            parsedFavorites.push(recipe);
          }
        }
        const isFavorited = parsedFavorites.some(item => item.info.id === recipe.info.id);
        return AsyncStorage.setItem('@userFavorites', JSON.stringify(parsedFavorites)).then(() => {
          const ref = db.collection('favorites').doc(userId);
          return ref.set({
            userId,
            items: JSON.stringify(parsedFavorites)
          }).then(() => isFavorited);
        });
      });
    }
  }
};
