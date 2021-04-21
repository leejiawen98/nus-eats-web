import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator,
        Dimensions, TextInput, Picker, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firebaseDb from '../firebaseDb'

export default class StallUpdateScreen extends React.Component {
    state = {
        hawkerName: '',
        hawkerId: '',
        stallId: '',
        foodId: '',
        foodName: '',
        price: '',
        rating: '',
        desc: '',
        image: '',
        imageExist: true,
        refId: '',
        isLoading: true,

        locationStyle1: 'ios-radio-button-on',
        locationStyle2: 'ios-radio-button-off',
    }

    componentDidMount() {
        const { stallId, foodId, foodName, price, rating, desc, image, refId } = this.props.route.params

        this.setState({
            stallId: stallId,
            foodId: foodId,
            foodName: foodName,
            price: price,
            rating: rating,
            desc: desc,
            image: image,
            refId: refId
        })

        firebaseDb
        .firestore()
        .collection('stall')
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                if (doc.data().stallId == stallId) {
                    this.setState({hawkerName: doc.data().address, hawkerId: doc.data().hawkerId, isLoading: false})
                }
            })
            this.changeLocation()
        }).catch(err => console.error(err)) 
    }

    handleFoodName = foodName => this.setState({ foodName })
    handlePrice = price => this.setState({ price })
    handleDesc = desc => this.setState({ desc })
    handleRating = rating => this.setState({ rating })


    uploadImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            aspect: [4, 3],
            quality: 1,
          });

        if (result.uri != null) {
            this.setState({image: result.uri, imageExist: true})
        }
    }

    changeLocation = () => {
        const { hawkerId } = this.state

        if (hawkerId == 'H07') {
            this.setState({ locationStyle1: 'ios-radio-button-off', locationStyle2: 'ios-radio-button-on', locationViewStyle: 'withCoordinate' })
        } else {
            this.setState({ locationStyle1: 'ios-radio-button-on', locationStyle2: 'ios-radio-button-off', latitude: 0, longitude: 0, locationViewStyle: 'withoutCoordinate'})
        }
    }

    submit = () => {
        const { foodName, price, rating, desc, image, refId } = this.state

        firebaseDb
        .firestore()
        .collection('food')
        .doc(refId)
        .update({
            foodName: foodName,
            price: price,
            overallFoodRating: rating,
            desc: desc,
            image: image
        })
        .then(()=> {
            alert('Updated!')
        }).catch(err => console.log(err)) 
    }

    delete = () => {
        firebaseDb
        .firestore()
        .collection('food')
        .doc(this.state.refId)
        .delete()
        .then(() => {
            alert('Deleted!')
            this.props.navigation.navigate('Food')
        }).catch(err => console.log(err)) 
    }

    render () {
        const screenWidth = Math.round(Dimensions.get('window').width);
        const { stallId, foodId, foodName, price, rating, desc, image, isLoading, hawkerName, locationStyle1, locationStyle2, imageExist} = this.state

        if (isLoading) 
            return <ActivityIndicator style = {{alignSelf: 'center', flex: 1}} size = 'large' color= 'tomato' />
    
        return (
            <View style = {styles.container}>
                <TouchableOpacity style = {{alignSelf: 'flex-start', position: 'absolute',}}
                    onPress = {() => this.props.navigation.goBack()}>
                    <Ionicons name = 'ios-arrow-back' style = {{fontSize: 30, color: 'tomato'}}/>
                </TouchableOpacity>
                <Text style = {{fontSize: 20, marginBottom: 10, fontWeight: 'bold'}}>
                    Update Food
                </Text>
                <View style = {{height: 1, backgroundColor: '#DCDCDC', marginBottom:10, width: screenWidth}}/>
                <ScrollView showsVerticalScrollIndicator = {false}>
                <View style = {{flex: 1.5, marginVertical: 10}}>
                    <Text style = {{fontWeight: 'bold'}}>Stall ID</Text>
                    <TextInput style = {styles.IDTextInput} 
                        value = {stallId} editable = {false}/>
                </View>
                <View style = {{flex: 1.5, marginVertical: 10}}>
                    <Text style = {{fontWeight: 'bold', marginBottom: 5}}>Location</Text>
                    <View style = {{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                        <TouchableOpacity style = {{flexDirection: 'row', alignItems: 'center'}}>
                            <Ionicons name = {locationStyle1} color = 'tomato'/>
                            <Text style = {{marginLeft: 5}}>Hawker Centre</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {{flexDirection: 'row', alignItems: 'center'}}>
                            <Ionicons name = {locationStyle2} color = 'tomato'/>
                            <Text style = {{marginLeft: 5}}>Restaurant</Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <TextInput style = {styles.IDTextInput} 
                            value = {hawkerName} editable = {false}/>
                    </View>
                </View>
                <View style = {{flex: 1.5, marginVertical: 10}}>
                    <Text style = {{fontWeight: 'bold'}}>Food ID</Text>
                    <TextInput style = {styles.IDTextInput} 
                        value = {foodId} editable = {false}/>
                </View>
                <View style = {{flex: 1, marginVertical: 10}}>
                        <Text style = {{fontWeight: 'bold'}}>Food Name</Text>
                        <TextInput style = {styles.textInput} 
                            value = {foodName} onChangeText = {this.handleFoodName}/>
                </View>

                <View style = {{flex: 1, marginVertical: 10}}>
                        <Text style = {{fontWeight: 'bold'}}>Price ($)</Text>
                        <TextInput style = {styles.textInput} 
                            value = {price} onChangeText = {this.handlePrice}/>
                </View>
                
                <View style = {{flex: 2, marginVertical: 10}}>
                    <Text style = {{fontWeight: 'bold'}}>Description</Text>
                    <TextInput style = {{width: 300, height: 100, borderColor: '#DCDCDC', borderWidth: 1, marginTop: 5, padding: 10, borderRadius: 3}}
                        multiline = {true}
                        value = {desc} onChangeText = {this.handleDesc}
                    />
                </View>
                <View style = {{flex: 1.5, marginVertical: 10}}>
                    <Text style = {{fontWeight: 'bold'}}>Rating</Text>
                    <TextInput style = {styles.textInput} 
                        value = {rating} onChangeText = {this.handleRating}/>
                </View>
            
                <View style = {{flex: 2, marginVertical: 10,}}>
                    <Text style = {{fontWeight: 'bold', marginBottom: 5}}>Image</Text>
                    { !imageExist ?
                    <TouchableOpacity style = {{backgroundColor: '#DCDCDC50', padding: 10, width: 300, borderRadius: 3}}
                        onPress = {() => this.uploadImage()}>
                        <Text>Upload</Text>
                    </TouchableOpacity>
                    :
                    <View style = {{width: 300, flexDirection: 'row'}}>
                        <Image source = {{uri : image}} style = {{width: 150, height: 80, borderRadius: 3}}/>
                        <TouchableOpacity onPress = {() => {
                            this.setState({imageExist: false, image: ''})
                        }}>
                            <Ionicons name = 'ios-close-circle' style = {{fontSize: 30, color: 'tomato', marginLeft: 10,}}/>
                        </TouchableOpacity>
                    </View>
                    }
                </View>
            
                <View style = {{flexDirection: 'row'}}>
                    <TouchableOpacity style = {{backgroundColor: 'dodgerblue', padding: 10, width: 150, borderRadius: 3}}
                        onPress = {() => this.submit()}>
                        <Text style = {{textAlign: 'center', color: 'white', fontWeight: 'bold'}}>
                            Update
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style = {{backgroundColor: 'crimson', padding: 10, width: 150, borderRadius: 3, marginLeft: 5}}
                        onPress = {() => this.delete()}>
                        <Text style = {{textAlign: 'center', color: 'white', fontWeight: 'bold'}}>
                            Delete
                        </Text>
                    </TouchableOpacity>
                </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        padding: 20,
        alignItems: 'center'
    },
    textInput: {
        width: 300, 
        height: 50, 
        borderColor: '#DCDCDC', 
        borderWidth: 1, 
        marginTop: 5, 
        padding: 10,
        borderRadius: 3
    },
    IDTextInput: {
        width: 300, 
        height: 50, 
        borderColor: '#DCDCDC', 
        borderWidth: 1, 
        marginTop: 5, 
        padding: 10,
        borderRadius: 3,
        backgroundColor: '#DCDCDC50'
    },
    withCoordinates: {
        flex: 2, 
        marginVertical: 10
    },
    withoutCoordinates: {
        flex: 1.5, 
        marginVertical: 10
    }

})
