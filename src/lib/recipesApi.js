// import { groupBy } from "lodash";
import settings from '../config/settings';
import { paramsToString } from './utils';

const BASE_URL = settings.RECIPES_API_BASE_URL;
const API_CREDENTIALS = settings.RECIPES_API_CREDENTIALS;

export const getRecipeById = id => fetch(`${BASE_URL}/recipes/${id}/information?includeNutrition=true`, {
  method: 'GET',
  headers: {
    ...API_CREDENTIALS,
  },
}).then(response => response.json());


export const getWeekRecipes = ({ caloriesPerMeal, diet, exclude }) => {
  const inputs = {
    timeFrame: 'week',
    targetCalories: caloriesPerMeal,
    diet,
    exclude
  };

  return fetch(
    `${BASE_URL}/recipes/mealplans/generate?${paramsToString(inputs)}`,
    {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        ...API_CREDENTIALS,
      },
    },
  )
    .then(response => response.json())
    .then(async (response) => {
      const recipes = await Promise.all(response.items.map((recipe) => {
        const { id } = JSON.parse(recipe.value);
        return getRecipeById(id);
      }));
      response.items = response.items.map((item) => {
        const info = recipes.find(recipe => recipe.id === JSON.parse(item.value).id);
        return { ...item, info };
      });
      return response;
    });
  // .then((response) => {
  //   const mealsPerDay = groupBy(response.items, 'day') || [];
  //   // console.warn(JSON.stringify(mealsPerDay));
  //   return {
  //     mealId: response.name,
  //     items: Object.keys(mealsPerDay).map((dayNumber) => {
  //       const recipes = mealsPerDay[dayNumber];
  //       return Object.assign({}, ...mealsPerDay[dayNumber], { value: recipes });
  //     }),
  //   };
  // });
};
