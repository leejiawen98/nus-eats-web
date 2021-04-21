import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator,
        Dimensions, TextInput, Picker, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firebaseDb from '../firebaseDb'
import MapView from 'react-native-maps';

export default class StallUpdateScreen extends React.Component {
    state = {
        stallId: '',
        address: '',
        stallName: '',
        image: '',
        imageExist: true,
        rating: 0,
        cuisineType: '',
        openingHours: '',
        closingHours: '',
        latitude: 0,
        longitude: 0,
        hawkerId: '',
        refId: '',
        creationDate: '',

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
        const { stallId, address, hawkerId, stallName, cuisineType, openingHours, closingHours, image, coordinate, refId, rating, creationDate } = this.props.route.params

        this.setState({
            stallId: stallId,
            hawkerId: hawkerId,
            stallName: stallName,
            address: address,
            cuisineType: cuisineType,
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            image: image,
            openingHours: this.convertTime(openingHours),
            closingHours: this.convertTime(closingHours),
            refId: refId,
            rating: rating,
            creationDate: creationDate
        })

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
            if (hawkerId == 'H07') {
                this.changeLocation()
            }
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
        const { locationStyle1 } = this.state

        if (locationStyle1 == 'ios-radio-button-on') {
            this.setState({ locationStyle1: 'ios-radio-button-off', locationStyle2: 'ios-radio-button-on', locationViewStyle: 'withCoordinate' })
        } else {
            this.setState({ locationStyle1: 'ios-radio-button-on', locationStyle2: 'ios-radio-button-off', latitude: 0, longitude: 0, locationViewStyle: 'withoutCoordinate'})
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
        const { address, hawkerId, stallName, cuisineType, openingHours, closingHours, image, latitude, longitude, rating } = this.state

        let openingHour1 = openingHours.substring(0, openingHours.indexOf(':'))
        let openingHour2 = openingHours.substring(openingHours.indexOf(':')+1)

        let closingHour1 = closingHours.substring(0, closingHours.indexOf(':'))
        let closingHour2 = closingHours.substring(closingHours.indexOf(':')+1)

        firebaseDb
        .firestore()
        .collection('stall')
        .doc(this.state.refId)
        .update({
            address: address,
            hawkerId: hawkerId,
            stallName: stallName,
            cuisineType: cuisineType,
            monTofriOpening: firebaseDb.firestore.Timestamp.fromDate(new Date(2000, 0, 1, openingHour1, openingHour2, 0, 0)),
            monTofriClosing: firebaseDb.firestore.Timestamp.fromDate(new Date(2000, 0, 1, closingHour1, closingHour2, 0, 0)),
            image: image,
            overallStallRating: parseFloat(rating),
            coordinate: new firebaseDb.firestore.GeoPoint(parseFloat(latitude), parseFloat(longitude)),

        })
        .then(()=> {
            alert('Updated!')
        }).catch(err => console.log(err)) 
    }

    delete = () => {
        firebaseDb
        .firestore()
        .collection('stall')
        .doc(this.state.refId)
        .delete()
        .then(() => {
            alert('Deleted!')
            this.props.navigation.navigate('Stalls')
        }).catch(err => console.log(err)) 
    }

    convertTime = (date) => {
        let format = new Date(date.toDate())
        let hour = format.getHours()
        let min = format.getMinutes()

        return min == 0 ? hour + ':' + min + '0' : hour + ':' + min
    }

    convertDateTime = (date) => {
        let format = new Date(date.toDate())
        let hour = format.getHours()
        let min = format.getMinutes()
        let day = format.getDate()
        let month = format.getMonth()
        let year = format.getFullYear()

        let dateFormat = day + '-' + (month+1) + '-' + year

        return min == 0 ? dateFormat + ', ' + hour + ':' + min + '0' : dateFormat + ', ' + hour + ':' + min
    }

    render () {
        const screenWidth = Math.round(Dimensions.get('window').width);
        const { address, stallName, cuisineType, openingHours, closingHours, creationDate,
            image, imageExist, isLoading, stallId, rating, latitude, longitude, locationStyle1, locationStyle2 } = this.state

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
                    Update Stall
                </Text>
                <View style = {{height: 1, backgroundColor: '#DCDCDC', marginBottom:10, width: screenWidth}}/>
                <ScrollView showsVerticalScrollIndicator = {false}>
                <View style = {{flex: 1.5, marginVertical: 10}}>
                    <Text style = {{fontWeight: 'bold'}}>Stall ID</Text>
                    <TextInput style = {styles.IDTextInput} 
                        value = {stallId} editable = {false}/>
                </View>
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
                <View style = {{flex: 1.5, marginVertical: 10}}>
                    <Text style = {{fontWeight: 'bold'}}>Stall Name</Text>
                    <TextInput style = {styles.textInput} 
                        value = {stallName} onChangeText = {this.handleStallName}/>
                </View>
                <View style = {{flex: 1.5, marginVertical: 10}}>
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
                <View style = {{flex: 1.5, marginVertical: 10}}>
                    <Text style = {{fontWeight: 'bold'}}>Rating</Text>
                    <TextInput style = {styles.textInput} 
                        value = {rating} onChangeText = {this.handleRating}/>
                </View>
                <View style = {{flex: 1.5, marginVertical: 10}}>
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
                <View style = {{flex: 1.5, marginVertical: 10}}>
                    <Text style = {{fontWeight: 'bold'}}>Created on</Text>
                    <TextInput style = {styles.IDTextInput} 
                        value = {this.convertDateTime(creationDate)} editable = {false}/>
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
