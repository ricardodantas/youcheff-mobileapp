import {
  RECIPES_API_BASE_URL,
  RECIPES_API_IMAGE_BASE_URL,
  RECIPES_API_HOST,
  RECIPES_API_KEY,
  BUGSNAG_API_KEY
} from 'react-native-dotenv';

export default settings = {
  TRIAL_DAYS: 7,
  PUSH_NOTIFICATION: {
    TOPIC_GENERAL: 'GENERAL'
  },
  DEFAULT_USER_PREFERENCES: {
    caloriesPerMeal: 2000,
    allergies: [],
    diet: null
  },
  CONFIRM_REFRESH_RECIPES_TITLE: 'Confirm new recipes suggestion for the week?',
  CONFIRM_REFRESH_RECIPES_TEXT: 'All recipes and shopping lists will be replaced.',
  LOGOUT_MESSAGE: 'Are you sure you want to log out?',
  DEFAULT_ERROR_MESSAGE: 'We detected something wrong, please try again later.',
  RECIPES_API_IMAGE_BASE_URL,
  RECIPES_API_BASE_URL,
  RECIPES_API_CREDENTIALS: {
    'X-RapidAPI-Host': RECIPES_API_HOST,
    'X-RapidAPI-Key': RECIPES_API_KEY,
  },
  BUGSNAG_API_KEY,
  WEEK_DAYS: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  MEAL_TYPE: {
    1: 'Breakfast',
    2: 'Lunch',
    3: 'Dinner',
  },
  ALLERGY_OPTIONS: [
    'shellfish', 'diary',
    'egg', 'peanut', 'gluten', 'seafood',
    'sesame', 'soy', 'wheat', 'tree nut'
  ],
  DIET_OPTIONS: [
    'vegetarian',
    'vegan',
    'lacto vegetarian',
    'ovo vegetarian',
    'low carb'
  ]
};
