import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WebHeader from '../component/WebHeader'

import HomeScreen from '../container/HomeScreen'
import HawkerScreen from '../container/HawkerScreen'
import StallScreen from '../container/StallScreen'
import FoodScreen from '../container/FoodScreen'
import HawkerAddScreen from '../container/HawkerAddScreen'
import HawkerUpdateScreen from '../container/HawkerUpdateScreen'
import StallAddScreen from '../container/StallAddScreen'
import StallUpdateScreen from '../container/StallUpdateScreen'
import FoodAddScreen from '../container/FoodAddScreen'
import FoodUpdateScreen from '../container/FoodUpdateScreen'



import DrawerNavigator from './DrawerNavigator';


const RootStack = createStackNavigator();

const StackNavigator = () => (
    <NavigationContainer>
        <WebHeader />

        <RootStack.Navigator headerMode= 'none' screenOptions={{gestureEnabled: false}}>
            <RootStack.Screen name="Home" children = {DrawerNavigator} independent = {true}/>
            <RootStack.Screen name="Hawker Centres" children = {DrawerNavigator} independent = {true}/>
            <RootStack.Screen name="Stalls" children = {DrawerNavigator} independent = {true}/>
            <RootStack.Screen name="Food" children = {DrawerNavigator} independent = {true}/>

            <RootStack.Screen name ="Add Hawker" component= {HawkerAddScreen} options={{headerShown: false}}/>
            <RootStack.Screen name ="Update Hawker" component= {HawkerUpdateScreen} options={{headerShown: false}}/>
            <RootStack.Screen name ="Add Stall" component= {StallAddScreen} options={{headerShown: false}}/>
            <RootStack.Screen name ="Update Stall" component= {StallUpdateScreen} options={{headerShown: false}}/>
            <RootStack.Screen name ="Add Food" component= {FoodAddScreen} options={{headerShown: false}}/>
            <RootStack.Screen name ="Update Food" component= {FoodUpdateScreen} options={{headerShown: false}}/>
        </RootStack.Navigator>  
    </NavigationContainer>
);

export default StackNavigator;