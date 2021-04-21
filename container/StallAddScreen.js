import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator,
        Dimensions, TextInput, Picker, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firebaseDb from '../firebaseDb'
import MapView from 'react-native-maps';

export default class StallAddScreen extends React.Component {
    state = {
        stallId: '',
        hawkerId: '',
        address: '',
        stallName: '',
        image: '',
        imageExist: false,
        cuisineType: '',
        openingHours: '',
        closingHours: '',
        latitude: 0,
        longitude: 0,

        hawkers: null,
        hawkerNames: null,
        isLoading: true,

        locationStyle1: 'ios-radio-button-on',
        locationStyle2: 'ios-radio-button-off',
        locationViewStyle: '',

        x: {
            latitude: 1.296551, 
            longitude: 103.776378,
        }

    }

    componentDidMount() {
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
            this.setState({stallId: Object.keys(results).length + 1})
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
    }

    handleStallName = stallName => this.setState({ stallName })
    handleAddress = address => this.setState({ address, hawkerId: 'H07' })
    handleCuisine = (cuisineType) => this.setState({ cuisineType })
    handleOpening = openingHours => this.setState({ openingHours })
    handleClosing = closingHours => this.setState({ closingHours })
    handleLatitude = latitude => this.setState({ latitude })
    handleLongitude = longitude => this.setState({ longitude })

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
        this.setState({ address: hawkerName })
        for (var i = 0; i < Object.keys(this.state.hawkers).length; i ++) {
            if (this.state.hawkers[i].hawkerName == hawkerName) {
                this.setState({ hawkerId: this.state.hawkers[i].hawkerId })
            }
        }
    }

    submit = () => {
        const { stallId, address, hawkerId, stallName, cuisineType, openingHours, closingHours, image, latitude, longitude } = this.state

        let openingHour1 = openingHours.substring(0, openingHours.indexOf(':'))
        let openingHour2 = openingHours.substring(openingHours.indexOf(':')+1)

        let closingHour1 = closingHours.substring(0, closingHours.indexOf(':'))
        let closingHour2 = closingHours.substring(closingHours.indexOf(':')+1)

        firebaseDb
        .firestore()
        .collection('stall')
        .add({
            stallId: stallId < 9 ? 'S0' + (stallId + 1) : 'S' + (stallId + 1),
            address: address,
            hawkerId: hawkerId,
            stallName: stallName,
            cuisineType: cuisineType,
            monTofriOpening: firebaseDb.firestore.Timestamp.fromDate(new Date(2000, 0, 1, openingHour1, openingHour2, 0, 0)),
            monTofriClosing: firebaseDb.firestore.Timestamp.fromDate(new Date(2000, 0, 1, closingHour1, closingHour2, 0, 0)),
            image: image,
            overallStallRating: 0,
            creationDate: firebaseDb.firestore.Timestamp.fromDate(new Date()),
            coordinate: new firebaseDb.firestore.GeoPoint(parseFloat(latitude), parseFloat(longitude)),

        })
        .then(()=> {
            alert('Submitted!')
            this.setState({
                stallId: stallId + 1,
                address: '',
                hawkerId: '',
                stallName: '',
                cuisineType: '',
                monTofriOpening: '',
                monTofriClosing: '',
                imageExist: false,
                image: '',
            })
        }).catch(err => console.log(err)) 
    }

    render () {
        const screenWidth = Math.round(Dimensions.get('window').width);
        const { address, stallName, cuisineType, openingHours, closingHours, 
            image, imageExist, isLoading, locationStyle1, locationStyle2, latitude, longitude } = this.state

        if (isLoading) 
            return <ActivityIndicator style = {{alignSelf: 'center', flex: 1}} size = 'large' color= 'tomato' />

        let hawkerItems = this.state.hawkerNames.map( (s, i) => {
            return <Picker.Item key={i} value={s} label={s} />
        });

        return (
            <View style = {styles.container}>
                <TouchableOpacity style = {{alignSelf: 'flex-start', position: 'absolute',}}
                    onPress = {() => this.props.navigation.goBack()}>
                    <Ionicons name = 'ios-arrow-back' style = {{fontSize: 30, color: 'tomato'}}/>
                </TouchableOpacity>
                <Text style = {{fontSize: 20, marginBottom: 10, fontWeight: 'bold'}}>
                    Add New Stall
                </Text>
                <View style = {{height: 1, backgroundColor: '#DCDCDC', marginBottom:10, width: screenWidth}}/>
                <ScrollView>
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
                        <Picker style = {styles.textInput} 
                            selectedValue = {address} onValueChange = {(itemValue, itemIndex) => this.selectedHawker(itemValue)} 
                        >
                            <Picker.Item value='default' label='(Select)' />
                            {hawkerItems}
                        </Picker>
                        :
                        <View>
                            <TextInput style = {styles.textInput} 
                                placeholder = 'e.g. School of Computing'
                                value = {address} onChangeText = {this.handleAddress}/>
                            <View style = {{flex: 1, marginVertical: 10}}>
                                <Text style = {{fontWeight: 'bold'}}>Coordinates (Latitude, Longitude)</Text>
                                <View style = {{flexDirection: 'row'}}>
                                    <TextInput style = {{width: 150, height: 50, borderColor: '#DCDCDC', borderWidth: 1, marginTop: 5, marginRight: 5, padding: 10, borderRadius: 3}}
                                        placeholder = 'Latitude'
                                        value = {latitude} onChangeText = {this.handleLatitude}
                                    />
                                    <TextInput style = {{width: 150, height: 50, borderColor: '#DCDCDC', borderWidth: 1, marginTop: 5, padding: 10, borderRadius: 3}}
                                        placeholder = 'Longitude'
                                        value = {longitude} onChangeText = {this.handleLongitude}
                                    />
                                </View>
                                <MapView initialRegion = {this.state.x} style = {{flex: 1, height: 150, marginTop: 10}}>
                                    <MapView.Marker
                                    draggable
                                    coordinate={this.state.x}
                                    onDragEnd={(e) => {
                                    this.setState({x: {
                                        latitude: e.latLng.lat(),
                                        longitude: e.latLng.lng()
                                        },
                                        latitude: e.latLng.lat(),
                                        longitude: e.latLng.lng()
                                    })
                                    }}
                                    />
                            </MapView>
                            </View>
                        </View>
                        }
                    </View>
                    <View style = {{flex: 1, marginVertical: 10}}>
                        <Text style = {{fontWeight: 'bold'}}>Stall Name</Text>
                        <TextInput style = {styles.textInput} 
                            value = {stallName} onChangeText = {this.handleStallName}/>
                    </View>
                    <View style = {{flex: 1, marginVertical: 10}}>
                        <Text style = {{fontWeight: 'bold'}}>Cuisine Type</Text>
                        <Picker style = {styles.textInput} 
                            selectedValue = {cuisineType} onValueChange = {(itemValue, itemIndex) => this.handleCuisine(itemValue)} 
                        >
                            <Picker.Item value='Chinese' label='Chinese' />
                            <Picker.Item value='Western' label='Western' />
                            <Picker.Item value='Japanese/Korean' label='Japanese/Korean' />
                            <Picker.Item value='Halal' label='Halal' />
                            <Picker.Item value='Others' label='Others' />
                        </Picker>
                    </View>
                    <View style = {{flex: 1, marginVertical: 10}}>
                        <Text style = {{fontWeight: 'bold'}}>Operating Hours (e.g. 8:30 - 21:00)</Text>
                        <View style = {{flexDirection: 'row'}}>
                            <TextInput style = {{width: 150, height: 50, borderColor: '#DCDCDC', borderWidth: 1, marginTop: 5, marginRight: 5, padding: 10, borderRadius: 3}}
                                placeholder = 'Opening Hour'
                                value = {openingHours} onChangeText = {this.handleOpening}
                            />
                            <TextInput style = {{width: 150, height: 50, borderColor: '#DCDCDC', borderWidth: 1, marginTop: 5, padding: 10, borderRadius: 3}}
                                placeholder = 'Closing Hour'
                                value = {closingHours} onChangeText = {this.handleClosing}
                            />
                        </View>
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
    withCoordinates: {
        flex: 2, 
        marginVertical: 10
    },
    withoutCoordinates: {
        flex: 1.5, 
        marginVertical: 10
    }
})
