import React from 'react';
import { View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
// import WebHeader from '../component/WebHeader'

import HomeScreen from '../container/HomeScreen'
import HawkerScreen from '../container/HawkerScreen'
import StallScreen from '../container/StallScreen'
import FoodScreen from '../container/FoodScreen'

import StackNavigator from './StackNavigator'

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    // <NavigationContainer>
    //     <WebHeader />
        <Drawer.Navigator 
            drawerType = 'permanent' 
            drawerStyle = {{backgroundColor: '#DCDCDC50', width: 275}}
            drawerContentOptions = {{
                activeTintColor: 'tomato'
            }}
        >
            <Drawer.Screen name="Home" component = {HomeScreen}/>
            <Drawer.Screen name="Hawker Centres" component = {HawkerScreen}/>
            <Drawer.Screen name="Stalls" component = {StallScreen}/>
            <Drawer.Screen name="Food" component = {FoodScreen}/>
            {/* <Drawer.Screen name = "Add Hawker" children = {StackNavigator} independent = {true} 
            options = {{
                drawerLabel: () => null,
                title: null,
                drawerIcon: () => null
            }}
            /> */}
        </Drawer.Navigator>
    // </NavigationContainer>
  );
}

class Hidden extends React.Component {
    render() {
      return null;
    }
  }

export default DrawerNavigator;