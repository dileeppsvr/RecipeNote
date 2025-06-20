import { StyleSheet } from 'react-native';
import invert from 'invert-color';

export function getThemeColor(){
    return global.themeColor == undefined ? '#4682b4' : global.themeColor;
}

export function getInvertedColor(){
    return global.themeColor == undefined ? invert('#4682b4', true) : invert(global.themeColor, true)
}

export function ingredientRow(name, quantity){
    return {
        name: name,
        quantity: quantity
    }
}

export function dataItem (name, indgredientsList, description, recipeBy, imageLink, isVeg, tagsList, isFavorite, videoLink) {
    return {
      name: name,
      indgredientsList: indgredientsList,
      description: description,
      recipeBy: recipeBy,
      imageLink: imageLink,
      isVeg: isVeg,
      tagsList: tagsList,
      isFavorite: isFavorite, 
      videoLink: videoLink
    }

  }

  export function filterItem (key, value) {
      return {
          key: key,
          value: value
      }
  }
