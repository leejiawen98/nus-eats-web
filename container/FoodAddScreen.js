import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator,
        Dimensions, TextInput, Picker } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firebaseDb from '../firebaseDb'

export default class FoodAddScreen extends React.Component {
    state = {
        stallId: '',
        stallRefId: '',
        foodId: '',
        foodName: '',
        image: '',
        imageExist: false,
        price: 0,
        desc: '',

        stallName: '',

        hawkers: null,
        hawkerNames: null,
        stalls: null,
        stallNames: [],
        restaurantNames: [],
        isLoading: true,

        locationStyle1: 'ios-radio-button-on',
        locationStyle2: 'ios-radio-button-off',
        locationViewStyle: ''

    }

    componentDidMount() {
        firebaseDb
        .firestore()
        .collection('food')
        .get()
        .then(querySnapshot => {
            const results = []
            querySnapshot.docs.map(documentSnapshot => 
                results.push({
                    ...documentSnapshot.data(),
                    id: documentSnapshot.id
                })
            ) 
            this.setState({foodId: Object.keys(results).length + 1})
        }).catch(err => console.error(err)) 

        firebaseDb
        .firestore()
        .collection('hawker')
        .get()
        .then(querySnapshot => {
            const results = []
            const hawkerNames = []
            querySnapshot.forEach(doc => {
                results.push(doc.data())
                hawkerNames.push(doc.data().hawkerName)
            })
            this.setState({hawkers: results, hawkerNames: hawkerNames, isLoading: false})
        }).catch(err => console.error(err)) 

        firebaseDb
        .firestore()
        .collection('stall')
        .get()
        .then(querySnapshot => {
            const results = []
            querySnapshot.docs.map(documentSnapshot => 
                results.push({
                    ...documentSnapshot.data(),
                    id: documentSnapshot.id
                })
            ) 

            const restaurantNames = []
            querySnapshot.forEach(doc => {
                if (doc.data().hawkerId == 'H07') 
                    restaurantNames.push(doc.data().stallName)
            })
            this.setState({stalls: results, restaurantNames: restaurantNames,})
        }).catch(err => console.error(err)) 
        
    }

    handleFoodName = foodName => this.setState({ foodName })
    handlePrice = price => this.setState({ price })
    handleDesc = desc => this.setState({ desc })
    handleStallName = (stallName) => this.setState({ stallName })

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
        const { locationStyle1 } = this.state

        if (locationStyle1 == 'ios-radio-button-on') {
            this.setState({ locationStyle1: 'ios-radio-button-off', locationStyle2: 'ios-radio-button-on', locationViewStyle: 'withCoordinate' })
        } else {
            this.setState({ locationStyle1: 'ios-radio-button-on', locationStyle2: 'ios-radio-button-off', latitude: 0, longitude: 0, locationViewStyle: 'withoutCoordinate' })
        }
    }

    selectedHawker = (hawkerName) => {
        let stallNames = []
        for ( var i = 0; i < Object.keys(this.state.stalls).length; i++ ) {
            if (this.state.stalls[i].address == hawkerName ) {
                stallNames.push(this.state.stalls[i].stallName)
            }
        }
        this.setState({ stallNames: stallNames })
    }

    retrieveStalls = () => {
        return this.state.stallNames.map( (s, i) => {
            return <Picker.Item key={i} value={s} label={s} />
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.stallNames !== this.state.stallNames) {
            this.retrieveStalls()
        }
    }

    selectedStall = (stallName) => {
        const { stalls } = this.state
        for ( var i = 0; i < Object.keys(stalls).length; i++ ) {
            if (stalls[i].stallName == stallName) {
                this.setState({stallId: stalls[i].stallId, stallName: stallName, stallRefId: stalls[i].id })
            }
        }
    }

    submit = () => {
        const { desc, foodName, price, image, stallId, stallRefId, foodId } = this.state
        firebaseDb
        .firestore()
        .collection('food')
        .add({
            stallId: stallId,
            stallRefId: stallRefId,
            foodId: foodId < 10 ? 'F0' + (foodId) : 'F' + (foodId),
            foodName: foodName,
            image: image,
            overallFoodRating: (0).toFixed(2),
            price: parseFloat(price),
            refId: '',
            desc: desc,
            creationDate: firebaseDb.firestore.Timestamp.fromDate(new Date()),
        })
        .then((doc)=> {
            alert('Submitted!')
            this.setState({
                stallId: '',
                stallRefId: '',
                foodId: foodId + 1,
                foodName: '',
                image: '',
                overallFoodRating: 0,
                price: 0,
                refId: '',
                desc: ''
            })
            firebaseDb
            .firestore()
            .collection('food')
            .doc(doc.id)
            .update({
                refId: doc.id
            })

        }).catch(err => console.log(err)) 
    }

    render () {
        const screenWidth = Math.round(Dimensions.get('window').width);
        const { address, stallName, desc, foodName, price,
            image, imageExist, isLoading, locationStyle1, locationStyle2, } = this.state

        if (isLoading) 
            return <ActivityIndicator style = {{alignSelf: 'center', flex: 1}} size = 'large' color= 'tomato' />

        let hawkerItems = this.state.hawkerNames.map( (s, i) => {
            return <Picker.Item key={i} value={s} label={s} />
        });

        let restaurantItems = this.state.restaurantNames.map( (s, i) => {
            return <Picker.Item key={i} value={s} label={s} />
        });


        return (
            <View style = {styles.container}>
                <TouchableOpacity style = {{alignSelf: 'flex-start', position: 'absolute',}}
                    onPress = {() => this.props.navigation.goBack()}>
                    <Ionicons name = 'ios-arrow-back' style = {{fontSize: 30, color: 'tomato'}}/>
                </TouchableOpacity>
                <Text style = {{fontSize: 20, marginBottom: 10, fontWeight: 'bold'}}>
                    Add New Food
                </Text>
                <View style = {{height: 1, backgroundColor: '#DCDCDC', marginBottom:10, width: screenWidth}}/>
                <View style = {this.state.locationViewStyle}>
                    <Text style = {{fontWeight: 'bold', marginBottom: 5}}>Location</Text>
                    <View style = {{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                        <TouchableOpacity style = {{flexDirection: 'row', alignItems: 'center'}}
                            onPress = {() => this.changeLocation()}>
                            <Ionicons name = {locationStyle1} color = 'tomato'/>
                            <Text style = {{marginLeft: 5}}>Hawker Centre</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {{flexDirection: 'row', alignItems: 'center'}}
                            onPress = {() => this.changeLocation()}>
                            <Ionicons name = {locationStyle2} color = 'tomato'/>
                            <Text style = {{marginLeft: 5}}>Restaurant</Text>
                        </TouchableOpacity>
                    </View>
                    { locationStyle1 == 'ios-radio-button-on' ?
                    <View>
                        <Picker style = {styles.textInput} 
                            selectedValue = {address} onValueChange = {(itemValue, itemIndex) => this.selectedHawker(itemValue)} 
                        >
                            <Picker.Item value='default' label='(Select)' />
                            {hawkerItems}
                        </Picker>
                        <View style = {{flex: 1, marginVertical: 10}}>
                            <Text style = {{fontWeight: 'bold'}}>Stall</Text>
                            <Picker style = {styles.textInput} 
                                selectedValue = {stallName} onValueChange = {(itemValue, itemIndex) => this.selectedStall(itemValue)} 
                            >
                                <Picker.Item value='default' label='(Select)' />
                                {this.retrieveStalls()}
                            </Picker>
                        </View>
                    </View>
                    :
                    <View style = {{flex: 1, marginVertical: 10}}>
                        <Text style = {{fontWeight: 'bold'}}>Stall</Text>
                        <Picker style = {styles.textInput} 
                            selectedValue = {stallName} onValueChange = {(itemValue, itemIndex) => this.selectedStall(itemValue)} 
                        >
                            <Picker.Item value='default' label='(Select)' />
                            {restaurantItems}
                        </Picker>
                    </View>
                    }
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
                <TouchableOpacity style = {{backgroundColor: 'tomato', padding: 10, width: 300, borderRadius: 3}}
                    onPress = {() => this.submit()}>
                    <Text style = {{textAlign: 'center', color: 'white', fontWeight: 'bold'}}>
                        Submit
                    </Text>
                </TouchableOpacity>
                <View style = {{flex: 0.5}}/>
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
    withCoordinates: {
        flex: 2, 
        marginVertical: 10
    },
    withoutCoordinates: {
        flex: 1.5, 
        marginVertical: 10
    }
})
