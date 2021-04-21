import React from 'react';
import { Dimensions, StyleSheet, View, Image, Text } from 'react-native';

const screenWidth = Math.round(Dimensions.get('window').width);

const WebHeader = () => {
  return (
    <View style = {styles.container}>
        <View style = {styles.logo}>
            <View style = {styles.imageContainer}>
                <Image source = {require('../assets/logo.png')} style = {styles.image}/>
            </View>
            <Text style = {styles.text}>NUSeats</Text>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        height: 60, 
        width: screenWidth, 
        backgroundColor: 'white' ,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#DCDCDC90'
    },
    logo: {
        flex: 1,
        flexDirection: 'row',
        marginLeft: 15,
    },
    imageContainer: {   
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        height: 45, 
        width: 45,
    },
    text: {
        marginTop: 2,
        fontSize: 25,
        alignSelf: 'center',
        marginLeft: 5,
        fontWeight: 'bold',
        fontStyle: 'Verdana'
    }
})

export default WebHeader;