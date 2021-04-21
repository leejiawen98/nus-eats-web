import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator,
        Dimensions, TextInput, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firebaseDb from '../firebaseDb'
import MapView from 'react-native-maps';

export default class HawkerUpdateScreen extends React.Component {
    state = {
        isLoading: true,
        hawkerName: '',
        address: '',
        desc: '',
        latitude: null,
        longitude: null,
        image: '',
        imageExist: true,
        hawkerId: '',
        refId: '',
        x: {
            latitude: 1.296551, 
            longitude: 103.776378,
        }
    }

    componentDidMount() {
        const { hawkerId, hawkerName, address, desc, coordinate, image, refId } = this.props.route.params

        this.setState({
            hawkerId: hawkerId,
            hawkerName: hawkerName,
            address: address,
            desc: desc,
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            image: image,
            refId: refId,
            isLoading: false
        })
    }

    handleHawkerName = hawkerName => this.setState({ hawkerName })
    handleAddress = address => this.setState({ address })
    handleDesc = desc => this.setState({ desc })
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

    submit = () => {
        const { hawkerName, address, desc, latitude, longitude, image, refId } = this.state

        firebaseDb
        .firestore()
        .collection('hawker')
        .doc(refId)
        .update({
            hawkerName: hawkerName,
            address: address,
            desc: desc,
            coordinate: new firebaseDb.firestore.GeoPoint(parseFloat(latitude), parseFloat(longitude)),
            image: image,
        })
        .then(() => {
            alert('Updated!')
        }).catch(err => console.log(err)) 
    }

    delete = () => {
        firebaseDb
        .firestore()
        .collection('hawker')
        .doc(this.state.refId)
        .delete()
        .then(() => {
            alert('Deleted!')
            this.props.navigation.navigate('Hawker Centres')
        }).catch(err => console.log(err)) 
    }

    render () {
        const screenWidth = Math.round(Dimensions.get('window').width);
        const { isLoading, hawkerName, address, desc, latitude, longitude, image, imageExist, hawkerId } = this.state
       
        if (isLoading) 
            return <ActivityIndicator style = {{alignSelf: 'center', flex: 1}} size = 'large' color= 'tomato' />

        return (
            <View style = {styles.container}>
                <TouchableOpacity style = {{alignSelf: 'flex-start', position: 'absolute',}}
                    onPress = {() => this.props.navigation.goBack()}>
                    <Ionicons name = 'ios-arrow-back' style = {{fontSize: 30, color: 'tomato'}}/>
                </TouchableOpacity>
                <Text style = {{fontSize: 20, marginBottom: 10, fontWeight: 'bold'}}>
                    Update Hawker Centre
                </Text>
                <View style = {{height: 1, backgroundColor: '#DCDCDC', marginBottom:10, width: screenWidth}}/>
                <ScrollView>
                <View style = {{flex: 1, marginVertical: 10}}>
                    <Text style = {{fontWeight: 'bold'}}>Hawker ID</Text>
                    <TextInput style = {styles.IDTextInput} 
                        value = {hawkerId} editable = {false}/>
                </View>
                <View style = {{flex: 1, marginVertical: 10}}>
                    <Text style = {{fontWeight: 'bold'}}>Hawker Name</Text>
                    <TextInput style = {styles.textInput} 
                        value = {hawkerName} onChangeText = {this.handleHawkerName}/>
                </View>
                <View style = {{flex: 1, marginVertical: 10}}>
                    <Text style = {{fontWeight: 'bold'}}>Location</Text>
                    <TextInput style = {styles.textInput} 
                        placeholder = 'e.g. School of Computing'
                        value = {address} onChangeText = {this.handleAddress}/>
                </View>
                <View style = {{flex: 2, marginVertical: 10}}>
                    <Text style = {{fontWeight: 'bold'}}>Description</Text>
                    <TextInput style = {{width: 300, height: 100, borderColor: '#DCDCDC', borderWidth: 1, marginTop: 5, padding: 10, borderRadius: 3}}
                        placeholder = 'e.g. Operating Hours'
                        multiline = 'true'
                        value = {desc} onChangeText = {this.handleDesc}
                    />
                </View>
                <View style = {{flex: 1, marginVertical: 10}}>
                    <Text style = {{fontWeight: 'bold'}}>Coordinates</Text>
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
})
