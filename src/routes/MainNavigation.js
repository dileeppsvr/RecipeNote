import { NavigationContainer, useFocusEffect} from '@react-navigation/native';
import Home from '../components/Home';
import React from 'react';

export default function MainNavigation(){
 
       React.useEffect(()=>{
        global.themeColor = '#4682b4';
    },[])
        
   return(
         <Home/>
   );
};