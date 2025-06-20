import React, {useState, useEffect} from 'react';
import { View, Text, TextInput, Dimensions, TouchableOpacity, ScrollView, Image, TouchableWithoutFeedback, ToastAndroid, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUserCircle, faTimes, faHeart, faHome, faPlus, faSlidersH, faUserCog, faShareAlt, faDownload, faMicrophoneSlash, faMicrophone, faUserEdit, faPalette, faFileDownload, faTrash, faTrashAlt  } from '@fortawesome/free-solid-svg-icons';
import  { getThemeColor, getInvertedColor, dataItem, ingredientRow, filterItem } from '../styles/styles';
import AnimatedModal from 'react-native-modal';
import { TriangleColorPicker, fromHsv } from 'react-native-color-picker';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNShareFile from 'react-native-share-file'
import Tts from 'react-native-tts';
import RNFS from 'react-native-fs';
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
export default function Home ({navigation, route}) {

 

  const [searchText, setSearchText] = useState('');
  const [optionsVisibility, setOptionsVisibility] = useState(false);
  const [colorPickerVisibility, setColorPickerVisibility] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [data, setData] = useState([])
  const [userName, setUserName] = useState('Test-user');
  const [vegTypeFilters, setVegTypeFilters] = useState([filterItem('Veg', true), filterItem('Non-Veg', true)]);
  const [filters, setFilters] = useState([])


   useEffect(() => {
     const actual_data =   [
      dataItem('Curry leaves rice', [
        ingredientRow('Curry leaves', '1 bundle') ,
        ingredientRow('salt', 'Your choice') ,
        ingredientRow('rice', '1kg'),
        ingredientRow('oil', '100ml') ], 
        'Curry leaves rice description', 'Divyashree P V',
      '', true, ['Main Dish', 'Indian'], false, 'https://google.com/'),

      dataItem('Apple juice', [
        ingredientRow('Apple', '2pcs'),
        ingredientRow('Sugar', '200gms'),
        ingredientRow('Milk', '500ml')
       ], 'Apple juice description', 'Dileep kumar P V',
      '', true, ['Juice', 'Indian'], false, ''),

       dataItem('Maggi', [
         ingredientRow('Maggi', '1 packet'),
         ingredientRow('Water', '200ml'),
         ingredientRow('Onion', '3')
       ], 'Maggi description', 'John Doe',
      '', true, ['Fast Food', 'Mexican'], false, ''), 

      dataItem('Burger', [
        ingredientRow('Buns', '2'),
        ingredientRow('Tomato sauce', '1 packet'),
        ingredientRow('Vegetables', 'Your choice')
      ], 'Burger description', 'Tim doe',
      '', false, ['Fast Food', 'American'], false, ''),

      dataItem('Brinjal masala curry', [
        ingredientRow('Brinjal', '1/2 kg'),
        ingredientRow('salt', 'Your choice'),
        ingredientRow('Chilli Powder', '50gms')
      ], 'Brinjal masala curry description', 'Aswatha Lakshmi',
      '', true, ['Side Dish', 'Indian'], false, ''),
    ]
       setData(actual_data)
       setFilters(getTags(actual_data).map(tag => filterItem(toCamelCase(tag), true)))
   },[])
  function getTags(data) {
    return  [
      ...new Set(data.map(item => {
        return item.tagsList 
      }).reduce((res, tagsList) => {
        return res.concat(tagsList)
      }).map(tag => tag.toLowerCase()))
   ]
  }

  function toCamelCase(name) {
     return name.substring(0,1).toUpperCase() + name.substring(1, name.length).toLowerCase()
  }
  function ViewableData (data) {
   return data.filter(item => { 
      if(showOnlyFavorites){
         return item.isFavorite
      }
      else return true
    }).filter(item => {
      if(searchText != ''){
        const str = item.name + item.description + item.recipeBy
       return str.toLowerCase().includes(searchText.toLowerCase())
      } else return true
    }).filter(item => {
       if(vegTypeFilters.filter(item => item.key == 'Veg')[0].value){
          return true
       } else {
          return !item.isVeg;
       }
    }).filter(item => {
      if(vegTypeFilters.filter(item => item.key == 'Non-Veg')[0].value){
         return true
      } else {
         return item.isVeg;
      }
   }).filter(item => {
     const filtersList =  filters.filter(i => i.value).map(i => toCamelCase(i.key))
    return item.tagsList.map(tag => filtersList.includes(toCamelCase(tag))).reduce((res, bool) => {
       return res || bool
     })
   })
  }

  async function generatePdf(item, directory) {
    let title = `<div style="text-align:center; height: 40px"><h1 style="font-size: 40px;display: inline-block;">${item.name}&nbsp;&nbsp;&nbsp;</h1>`;
    let vegColor = item.isVeg ? 'green' : 'red';
    let isVeg = `<span style="background: ${vegColor};display: inline-block;;width: 25px; height: 25px; border-radius: '50%"><span style="background: ${vegColor};width: 22px; height: 22px; border-radius: 50%"></span></span></div>`;
    let recipeByTitle = `<div style="text-align:center; height: 70px"><h5 style="display: inline-block;font-size: 30px">Recipe by:&nbsp;&nbsp; </h5>`;
    let recipeBy = `<p style="display: inline-block;font-size: 30px">${item.recipeBy}</p></div>`;
    let tagsTitle = `<h3 style="font-size: 35px;height: 30px">Type: &nbsp;</h3>`;
    let tags = item.tagsList.reverse().concat('').reverse().reduce((res, str) => {
      return res + str + ",&nbsp;"
    })
    let tagsList = `<p style="font-size: 30px;">${tags.substring(0, tags.length - 7)}</p>`;
    let ingredientsTitle = `<h3 style="font-size: 35px; height: 10px">Ingredients: &nbsp;</h3>`;
    let ingredients = item.indgredientsList.reverse().concat('').reverse().reduce((res, str) => {
       return res + (str.name + "(" + str.quantity + "),&nbsp;");
    })
    let ingredientsList = `<p style="font-size: 30px;display: inline-block">${ingredients.substring(0, ingredients.length - 7)}</p>`;
     let descriptionTitle = `<h3 style=" font-size: 35px; height: 30px">Description:&nbsp;  </h3>`;
     let description = `<p style="font-size: 30px;">${item.description}</p>`;
     let videoLink = item.videoLink != '' ?
       `<a style="font-size: 30px;" href="${item.videoLink}">${item.videoLink}</a>`
      :
      `<p></p>`;
      let sharedBy = `<p style="font-size: 30px; text-align: right;margin-top: 100px">Shared by ${userName}</p>`;
     
     let options = {
       // html : `<h1 style="text-align:center;">${item.name}</h1>
       //         <h3></h3>`,
       html: title  + isVeg + recipeByTitle + recipeBy + tagsTitle + tagsList + ingredientsTitle + ingredientsList + descriptionTitle + description + videoLink + sharedBy,
       fileName : item.name,
       directory: directory 
     }
      const resp = await RNHTMLtoPDF.convert(options)
      return resp.filePath;
      // RNHTMLtoPDF.convert(options).then(res => alert(res.filePath)).catch(err => console.log(err))
      // return '';
   }

   function downloadPdf(item) {
    //  alert(RNFS.DocumentDirectoryPath)
     generatePdf(item,  'Download').then(res =>  {
      if(res != undefined && res != ''){
        
          // RNFS.moveFile(res, RNFS.ExternalStorageDirectoryPath + '/' + item.name + '.pdf').then(r => 
            ToastAndroid.show('Downloaded at '+res, ToastAndroid.BOTTOM)

            // )
       
      
      } else {
        ToastAndroid.show('Download failed! Try after some time ', ToastAndroid.BOTTOM)

      }
     }
      
      )
     .catch(err => console.log(err));

        // const docsDir = RNFS.CachesDirectoryPath;
      // const pdfPath = `${docsDir}/${item.name}.pdf`;
      // alert(JSON.stringify(page1));

      
   }

   function sharePdf(item) {
    generatePdf(item, RNFS.ExternalCachesDirectoryPath.replace('/storage/emulated/0/','')).then(res =>  {
      if(res != undefined || res != ''){
        // ToastAndroid.show('Downloaded at '+res, ToastAndroid.BOTTOM)
        RNShareFile.share({
          url:res
      })

      } else {
        ToastAndroid.show('Downloaded failed! Try after some time ', ToastAndroid.BOTTOM)

      }
     }
      
      )
     .catch(err => console.log(err));
       
    }

   function getImageUrl(url) {
       if(url != ''){
         return require('../../android/app/src/main/assets/chef.png');
       } else {
         return require('../../android/app/src/main/assets/chef.png');
       }
   }

   function getVegTypeImageUrl(isVeg) {
     if(isVeg) {
       return require('../../android/app/src/main/assets/veg.png')
     } else {
      return require('../../android/app/src/main/assets/non-veg.png')
     }
   }

   function toggleIsFavorite(item) {
     const newData = data.map(js => {
        if(js.name == item.name) {
            let changedJs = js;
            changedJs.isFavorite = !item.isFavorite;
            return changedJs;
        }
        else return js;
     })
     setData(newData);
   }

   function deleteItem(item) {
    Alert.alert(
			'Delete Recipe',
			'Are you sure you want to delete this recipe?', [{
					text: 'No',
					onPress: () => console.log('Cancel Pressed'),
					style: 'cancel'
			}, {
					text: 'Yes',
					onPress: () => {
					   setData(data.filter(row => {
               return row.name != item.name
             }))
					}
			}, ], {
					cancelable: false
			}
	 )
   }

   function toggleFilter(key, filtersList, setValue) {
    //  alert(JSON.stringify(vegTypeFilters))
      setValue(filtersList.map(item => {
        if(item.key == key) {
          return filterItem(key, !item.value)
        } else return item;
      }))
   }

   function isItemSelected(key, filtersList) {
     return filtersList.filter(item =>  item.key == key)[0].value
   }

  const FiltersComponent = () => (
    <AnimatedModal
    style={{ alignSelf: 'center', alignItems: 'center'}}
    isVisible={showFilters}
    onBackdropPress={() => setShowFilters(!showFilters)}
    backdropTransitionInTiming={0}
    backdropTransitionOutTiming={0}
    animationIn={'pulse'}
  >
  <View style={{alignItems: 'center', backgroundColor:'transparent' ,borderColor:getThemeColor(), borderWidth: 1, width: 0.9 * screenWidth, height: 0.8 * screenHeight}}>
    <View style={{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', height: '30%'}}>
   <TouchableOpacity onPress={() => toggleFilter('Veg', vegTypeFilters,(value) => setVegTypeFilters(value))}>
    <View style={{height:0.05 * screenHeight, width: 0.252 * screenWidth, borderRadius: 30, backgroundColor: isItemSelected('Veg', vegTypeFilters) ? getThemeColor() : 'transparent', alignItems: 'center', justifyContent: 'center', borderWidth: isItemSelected('Veg', vegTypeFilters) ? 0 : 2, borderColor: getThemeColor()}}>
    <View style={{flexDirection: 'row'}}>
    <Text style={{color: isItemSelected('Veg', vegTypeFilters) ? getInvertedColor() : getThemeColor(), fontWeight: '400'}}>VEG</Text>
    <Image 
    style={{width: 12, height: 12, marginLeft: '10%', marginTop: '4%'}}
    source={getVegTypeImageUrl(true)}
  />
 
    </View>
    </View>
    </TouchableOpacity>
    <TouchableOpacity  onPress={() => toggleFilter('Non-Veg', vegTypeFilters, (value) => setVegTypeFilters(value))}>
    <View style={{height:0.05 * screenHeight, width: 0.252 * screenWidth, borderRadius: 30, backgroundColor: isItemSelected('Non-Veg', vegTypeFilters) ? getThemeColor() : 'transparent', alignItems: 'center', justifyContent: 'center', borderWidth: isItemSelected('Non-Veg', vegTypeFilters) ? 0 : 2, borderColor: getThemeColor()}}>
    <View style={{flexDirection: 'row'}}>

    <Text style={{color: isItemSelected('Non-Veg', vegTypeFilters) ? getInvertedColor() : getThemeColor(), fontWeight: '400'}}>NON VEG</Text>
    <Image 
    style={{width: 12, height: 12, marginLeft: '10%', marginTop: '4%'}}
    source={getVegTypeImageUrl(false)}
  />
    </View>
    </View>
    </TouchableOpacity>
    </View>
    <View>
    <View style={{marginBottom:'3%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
      <TouchableOpacity onPress={() => {
        setFilters(filters.map(item => {
          return filterItem(item.key, false)
        }))
      }}>
      <Text style={{fontWeight: 'bold', color: getThemeColor()}}>Unselect All</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {
        setFilters(filters.map(item => {
          return filterItem(item.key, true)
        }))
      }}>
      <Text style={{fontWeight: 'bold', color: getThemeColor()}}>Select All</Text>
      </TouchableOpacity>
    </View>
<ScrollView>
    <View style={{ width: '98%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', flexWrap: 'wrap'}}>
      {
       filters.map(item => item.key).map(tag =>  (
          <TouchableOpacity key={tag} style={{marginBottom: 20}} onPress={() => toggleFilter(tag, filters, (value) => setFilters(value))}>
    <View style={{height:0.05 * screenHeight, width: 0.252 * screenWidth, borderRadius: 30, backgroundColor: isItemSelected(tag, filters) ? getThemeColor() : 'transparent', alignItems: 'center', justifyContent: 'center', borderWidth: isItemSelected(tag, filters) ? 0 : 2, borderColor: getThemeColor()}}>

    <Text style={{color: isItemSelected(tag, filters) ? getInvertedColor() : getThemeColor()}}>{tag}</Text>
    </View>

    </TouchableOpacity>
        )
          
        )
      }
    </View>
    </ScrollView>
    </View>
  </View>
  </AnimatedModal>
  )

  const ColorPickerComponent = () => (
   

    <AnimatedModal
    style={{ alignSelf: 'center', backgroundColor: '#ffffff', width: screenWidth}}
    isVisible={colorPickerVisibility}
    onBackdropPress={() => setColorPickerVisibility(!colorPickerVisibility)}
    backdropTransitionInTiming={0}
    backdropTransitionOutTiming={0}
    animationIn={'pulse'}
  >
  <TouchableOpacity onPress={() => setColorPickerVisibility(!colorPickerVisibility)}>
  <FontAwesomeIcon style={{alignSelf:'flex-end', marginRight: '5%', marginTop: '5%'}} icon={faTimes} size={25} color={'#808080'}  />
  </TouchableOpacity>
  <TriangleColorPicker
  onColorChange={color => global.themeColor = fromHsv(color)}
  style={{flex: 1}}
  // hideControls={true}
  defaultColor={getThemeColor()}
/>
      </AnimatedModal>
  );

  const Options = () => (
    <AnimatedModal
    style={{ alignSelf: 'center', alignItems: 'center'}}
    isVisible={optionsVisibility}
    onBackdropPress={() => setOptionsVisibility(!optionsVisibility)}
    backdropTransitionInTiming={0}
    backdropTransitionOutTiming={0}
    animationIn={'pulse'}
  >
  <View style={{marginBottom: '5%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', backgroundColor: getThemeColor(), width: 0.7 * screenWidth, height: 0.09 * screenHeight, borderRadius: 15}}>
  <FontAwesomeIcon icon={faUserCircle} size={25} color={getInvertedColor()} />
  <TextInput value={userName} onChangeText={(value) => setUserName(value)} style={{color: getInvertedColor(), fontWeight: 'bold', marginLeft: '7%', fontSize: 18, width: 0.52 * screenWidth}} placeholder="Enter your name here" placeholderTextColor={getInvertedColor() == '#ffffff' ? '#a9a9a9' : '#636c72'} />

  </View>
    <View style={{justifyContent: 'center', backgroundColor: 'white', width: 0.7 * screenWidth, alignItems: 'center', borderRadius: 15}}>
       
  { false &&   <TouchableOpacity
       onPress={() => setColorPickerVisibility(!colorPickerVisibility)}
       style={{flexDirection: 'row', marginTop:'4%', backgroundColor: '#ffffff', width: 0.5 * screenWidth, height: 0.09 * screenHeight, borderRadius: 30, alignItems: 'center', justifyContent: 'flex-start'}}>
       <FontAwesomeIcon icon={faUserEdit} size={25} color={getThemeColor()} />
       <Text style={{color: getThemeColor(), fontWeight: 'bold', marginLeft: '7%'}}>Edit Name</Text>
       </TouchableOpacity>
  }
       <TouchableOpacity
       onPress={() => setColorPickerVisibility(!colorPickerVisibility)}
       style={{flexDirection: 'row', marginTop:'4%', backgroundColor: '#ffffff', width: 0.5 * screenWidth, height: 0.09 * screenHeight, borderRadius: 30, alignItems: 'center', justifyContent: 'flex-start'}}>
       <FontAwesomeIcon icon={faPalette} size={25} color={getThemeColor()} />

       <Text style={{color: getThemeColor(), fontWeight: 'bold', marginLeft: '7%'}}>Change Theme</Text>
       </TouchableOpacity>
       <TouchableOpacity
       onPress={() => setColorPickerVisibility(!colorPickerVisibility)}
       style={{flexDirection: 'row', marginBottom: '4%', backgroundColor: '#ffffff', width: 0.5 * screenWidth, height: 0.09 * screenHeight, borderRadius: 30, alignItems: 'center', justifyContent: 'flex-start'}}>
       <FontAwesomeIcon icon={faFileDownload} size={25} color={getThemeColor()} />
       <Text style={{color: getThemeColor(), fontWeight: 'bold', marginLeft: '7%'}}>Set Download Path</Text>
       </TouchableOpacity>
    </View>
      </AnimatedModal>
  );
  
  return(
      <View style={{flex: 1}}>
      <View style={{flexDirection: 'row', backgroundColor:getThemeColor(), height: 0.1 * screenHeight, alignItems: 'center'}}>
      <View style={{marginLeft:'12%',alignItems:'center', flexDirection:'row',  width:0.7 * screenWidth, height: 0.07 * screenHeight, borderColor: '#DCDCDC', borderBottomWidth: 0.8}}>

      <TextInput
      value={searchText}
      onChangeText={value => setSearchText(value)}
      style={{width: 0.6 * screenWidth, marginLeft: '5%', marginRight: '5%', color: '#ffffff', fontSize: 16}}
      placeholder="Search by recipe, items here"
      placeholderTextColor={getInvertedColor()}
      />
<TouchableOpacity onPress={() => {
  setSearchText('')
}} disabled={searchText == ''}>
{
  searchText != '' && 
  <FontAwesomeIcon icon={faTimes} size={15} color={'#a9a9a9'}  />
}
</TouchableOpacity>
      </View>
     <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
     <FontAwesomeIcon style={{ marginLeft: '25%'}} icon={faSlidersH} size={24} color={'#dcdcdc'}  />
     </TouchableOpacity>   
      </View>
      <ScrollView contentContainerStyle={{ width: screenWidth, alignItems: 'center', marginBottom: '2%', marginTop: '2%'}}>
      {
        ViewableData(data).length > 0 &&

      ViewableData(data).map(item => (
          <TouchableOpacity key={item.name} onPress={() => alert('shows item details')} onLongPress={() => alert('long press')}>
          <View 
          style={{
            marginTop: '2%', height: 0.28 * screenHeight, 
            flexDirection: 'row',
          width: 0.89 * screenWidth, borderWidth: 0.8, borderColor: '#a9a9a9', 
          borderRadius: 15,
          shadowColor: '#808080',
		shadowOffset: {
			width: 0,
			height: 9,
		}, shadowOpacity: 0.5, shadowRadius: 12.35, elevation: 1,        
  }}>
  <View style={{width: '35%'}}>
  <Image 
    style={{width: '90%', height: '100%',resizeMode: 'contain', marginLeft: '5%'}}
    source={getImageUrl(item.imageLink)}
	/>
  </View>
  <View style={{width: '65%'}}>
  <View style={{flexDirection: 'row', alignSelf: 'center', marginTop: '8%'}}>
  <Text style={{fontWeight: 'bold', fontSize: 18, color: '#696969', flexWrap: 'wrap', width: '70%'}}>{item.name}</Text>
  <Image 
  style={{width: 20, height: 20, marginLeft: '5%', marginTop: '1%'}}
  source={getVegTypeImageUrl(item.isVeg)}
/>
  </View>
  <View style={{marginTop: '2%'}}>
  <Text style={{marginLeft: '10%', flexWrap: 'wrap', width: '90%'}}>Recipe by: {item.recipeBy}</Text>
  <ScrollView contentContainerStyle={{marginTop: '8%', flexDirection: 'row'}}  horizontal={true} showsHorizontalScrollIndicator={false}>
  {
      item.tagsList.map(tag => (
        <TouchableWithoutFeedback key={tag}>
        <View style={{marginLeft: 10, height:0.04 * screenHeight, width: 0.252 * screenWidth, borderRadius: 30, borderWidth: 1, borderColor: getThemeColor(), alignItems: 'center', justifyContent: 'center'}}>

        <Text style={{color: getThemeColor()}}>{tag}</Text>
        </View>
        </TouchableWithoutFeedback>

      ))
    }
  </ScrollView>  
  </View>
  <View style={{marginTop: 'auto', marginBottom: '5%', flexDirection: 'row', justifyContent: 'space-around', marginLeft: '10%'}}>
  <TouchableOpacity onPress={() => toggleIsFavorite(item)}>
  <FontAwesomeIcon style={{ marginLeft: '25%'}} icon={faHeart} size={20} color={item.isFavorite ? getThemeColor() : '#dcdcdc'}  />
  </TouchableOpacity>
  <TouchableOpacity onPress={() => deleteItem(item)}>
  <FontAwesomeIcon style={{ marginLeft: '25%'}} icon={faTrashAlt} size={18} color={getThemeColor()}  />
  </TouchableOpacity>
  <TouchableOpacity onPress={() => Tts.speak(item.description)}>
  <FontAwesomeIcon style={{ marginLeft: '25%'}} icon={faMicrophone} size={20} color={getThemeColor()}  />
  </TouchableOpacity>
 {false && <TouchableOpacity onPress={() => downloadPdf(item)}>
  <FontAwesomeIcon style={{ marginLeft: '25%'}} icon={faDownload} size={20} color={getThemeColor()}  />
  </TouchableOpacity>
 }
  <TouchableOpacity onPress={() => sharePdf(item)}>
  <FontAwesomeIcon style={{ marginLeft: '25%'}} icon={faShareAlt} size={20} color={getThemeColor()}  />
  </TouchableOpacity>
 
  </View>   
  </View>
     
    </View>
    </TouchableOpacity>
        )) 
      }
      {
        ViewableData(data).length <= 0 &&
        <View style={{alignItems: 'center', justifyContent: 'center', height: 0.8 * screenHeight}}>
        <Text>No recipes to show</Text>
        </View>
      }
      
      </ScrollView>
      <View style={{height:0.15 * screenWidth, backgroundColor: getThemeColor(), alignItems: 'center', justifyContent: 'space-around', flexDirection: 'row' }}>
      <TouchableOpacity onPress={() => setShowOnlyFavorites(!showOnlyFavorites)}>
       {
          showOnlyFavorites && <FontAwesomeIcon icon={faHome} size={30} color={'#ffffff'}  />
       } 
       {
         !showOnlyFavorites && <FontAwesomeIcon icon={faHeart} size={30} color={'#ffffff'}  />
       }
      </TouchableOpacity>
      <TouchableOpacity
      onPress={() => alert('Add Recipe')}
      style={{ backgroundColor: getThemeColor(), alignItems: 'center', justifyContent: 'center', height: 0.11 * screenWidth, width: 0.11 * screenWidth, borderRadius: 0.55 * screenWidth, borderWidth: 6, borderColor: '#ffffff'}}
      >
      <FontAwesomeIcon icon={faPlus} size={23} color={'#ffffff'} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setOptionsVisibility(!optionsVisibility)}>
     <FontAwesomeIcon icon={faUserCog} size={30} color={'#ffffff'}  />
     </TouchableOpacity>   
      </View>
    
      {Options()}
      {ColorPickerComponent()}
      {FiltersComponent()}
      </View>
  );
}