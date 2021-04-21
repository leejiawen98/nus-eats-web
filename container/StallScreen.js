import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator,
        ScrollView, Image } from 'react-native';
import firebaseDb from '../firebaseDb'

export default class StallScreen extends React.Component {
    state = {
        isLoading: true,
        stalls: null
    }

    componentDidMount() { 
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.retrieveAllStalls()
        });
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    convertTime = (date) => {
        let hour = new Date(date.toDate()).getHours() * 100
        let min = new Date(date.toDate()).getMinutes()
        return (hour + min) > 1000 ? hour + min : '0' + (hour+min)
    }

    retrieveAllStalls = () => {
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
            results.sort(   
                (a,b) => new Number(a.stallId.substring(1)) - new Number(b.stallId.substring(1)))
            this.setState({isLoading: false, stalls: results})
        }).catch(err => console.error(err)) 
    }

    render () {
        const { stalls, isLoading } = this.state

        if (isLoading) 
            return <ActivityIndicator style = {{alignSelf: 'center', flex: 1}} size = 'large' color= 'tomato' />

        return (
            <ScrollView>
                <View style = {styles.container}>
                    <View style = {{flexDirection: 'row'}}>
                        <Text style = {{fontSize: 25, marginBottom: 10, flex: 20}}>Stalls</Text>
                        <TouchableOpacity style = {{alignSelf: 'center', flex: 1}}
                            onPress = {() => this.props.navigation.navigate('Add Stall')}>
                            <Text style = {{color: 'tomato', fontSize: 20}}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    <View style = {{height: 1, backgroundColor: '#DCDCDC', marginBottom:10}}/>
                    <View>
                        <FlatList 
                                style = {{borderRadius: 5}}
                                data={stalls} 
                                ListHeaderComponent = {() => (
                                    <View style = {{flexDirection: 'row', padding: 10,}}>
                                        <Text style = {styles.text}>Stall ID</Text>
                                        <Text style = {styles.text}>Stall Name</Text>
                                        {/* <Text style = {styles.text}>Hawker ID</Text> */}
                                        <Text style = {styles.text}>Location</Text>
                                        <Text style = {styles.text}>Rating</Text>
                                        <Text style = {styles.text}>Opening Time</Text>
                                        <Text style = {styles.text}>Closing Time</Text>
                                        <Text style = {styles.text1}>Coordinate (Latitude, Longitude)</Text>
                                        <Text style = {styles.text}>Image</Text>
                                        <Text style = {{margin: 15, width: 150, fontWeight: 'bold'}}>Creation Date</Text>
                                    </View>   
                                )}
                                renderItem={ ({ item }) => (
                                    <TouchableOpacity style = {styles.hawkerButton} 
                                        onPress = {() => {
                                            this.props.navigation.navigate('Update Stall', {
                                                stallId: item.stallId,
                                                stallName: item.stallName,
                                                hawkerId: item.hawkerId,
                                                address: item.address,
                                                rating: item.overallStallRating,
                                                openingHours: item.monTofriOpening,
                                                closingHours: item.monTofriClosing,
                                                cuisineType: item.cuisineType,
                                                image: item.image,
                                                creationDate: item.creationDate,
                                                coordinate: item.coordinate,
                                                refId: item.id
                                            })
                                        }}> 
                                        <Text style = {{margin: 15, width: 100,}}>{item.stallId}</Text>
                                        <Text style = {{margin: 15, width: 100}}>{item.stallName}</Text>
                                        {/* <Text style = {{margin: 15, width: 100,}}>{item.hawkerId}</Text> */}
                                        <Text style = {{margin: 15, width: 100}}>{item.address}</Text>
                                        <Text style = {{margin: 15, width: 100}}>{item.overallStallRating.toFixed(2)}</Text>
                                        <Text style = {{margin: 15, width: 100}}>{this.convertTime(item.monTofriOpening)}</Text>
                                        <Text style = {{margin: 15, width: 100}}>{this.convertTime(item.monTofriClosing)}</Text>
                                        {item.hawkerId == 'H07' ? 
                                        <View style = {{margin: 15,}}>
                                        <Text style = {{width: 190}}>{ item.hawkerId == 'H07' ? item.coordinate.latitude : 'N/A'}</Text>
                                        <Text style = {{width: 190}}>{ item.hawkerId == 'H07' ? item.coordinate.longitude : 'N/A'}</Text>
                                        </View>
                                        :
                                        <Text style = {{margin: 15, width: 270}}>{ "Refer to Hawker's Coordinates"}</Text>
                                        }
                                        <Image source = {{uri: item.image}} style = {{width: 100, height: 50, borderRadius: 3, margin: 15}}/>
                                        <Text style = {{margin: 15, width: 150}}>{new Date(item.creationDate.toDate()).toString()}</Text>
                                    </TouchableOpacity>
                                )}
                        keyExtractor={ item => item.stallId } />
                    </View>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        padding: 20
    },
    button: {
        backgroundColor: '#00000010',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        flexDirection: 'row'
    },
    hawkerButton: {
        backgroundColor: '#00000010',
        borderRadius: 5,
        padding: 10,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#00000010'
    },
    text: {
        margin: 15,
        width: 100,
        fontWeight: 'bold'
    },
    text1: {
        margin: 15,
        width: 300,
        fontWeight: 'bold'
    }
})
