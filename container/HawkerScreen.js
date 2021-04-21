import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator,
        ScrollView, Image } from 'react-native';
import firebaseDb from '../firebaseDb'
export default class HawkerScreen extends React.Component {
    state = {
        isLoading: true,
        hawkers: null
    }

    componentDidMount() { 
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.retrieveAllHawkers()
        });
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    retrieveAllHawkers = () => {
        firebaseDb
        .firestore()
        .collection('hawker')
        .get()
        .then(querySnapshot => {
            const results = []
            querySnapshot.docs.map(documentSnapshot => {
                if (documentSnapshot.data().hawkerId != 'H07') {
                    results.push({
                        ...documentSnapshot.data(),
                        id: documentSnapshot.id
                    })
                }}
            ) 
            results.sort(   
                (a,b) => new Number(a.hawkerId.substring(1)) - new Number(b.hawkerId.substring(1)))
            this.setState({isLoading: false, hawkers: results})
        }).catch(err => console.error(err)) 
    }

    render () {
        const { hawkers, isLoading } = this.state

        if (isLoading) 
            return <ActivityIndicator style = {{alignSelf: 'center', flex: 1}} size = 'large' color= 'tomato' />

        return (
            <ScrollView>
                <View style = {styles.container}>
                    <View style = {{flexDirection: 'row'}}>
                        <Text style = {{fontSize: 25, marginBottom: 10, flex: 20}}>Hawker Centres</Text>
                        <TouchableOpacity style = {{alignSelf: 'center', flex: 1}}
                            onPress = {() => this.props.navigation.navigate('Add Hawker')}>
                            <Text style = {{color: 'tomato', fontSize: 20}}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    <View style = {{height: 1, backgroundColor: '#DCDCDC', marginBottom:10}}/>
                    <View>
                        <FlatList 
                                style = {{borderRadius: 5}}
                                data={hawkers} 
                                ListHeaderComponent = {() => (
                                    <View style = {{flexDirection: 'row', padding: 10,}}>
                                        <Text style = {styles.text}>Hawker ID</Text>
                                        <Text style = {styles.text}>Hawker Name</Text>
                                        <Text style = {styles.text}>Location</Text>
                                        <Text style = {{margin: 15, width: 150, fontWeight: 'bold'}}>Description</Text>
                                        <Text style = {{margin: 15, width: 120, fontWeight: 'bold'}}>
                                            Coordinates (1){"\n"}
                                            Latitude
                                        </Text>
                                        <Text style = {{margin: 15, width: 120, fontWeight: 'bold'}}>
                                            Coordinates (2){"\n"}
                                            Longitude
                                        </Text>
                                        <Text style = {styles.text}>Image</Text>
                                    </View>   
                                )}
                                renderItem={ ({ item }) => (
                                    <TouchableOpacity style = {styles.hawkerButton} 
                                        onPress = {() => {
                                            this.props.navigation.navigate('Update Hawker', {
                                                hawkerId: item.hawkerId,
                                                hawkerName: item.hawkerName,
                                                address: item.address,
                                                desc: item.desc,
                                                coordinate: item.coordinate,
                                                image: item.image,
                                                refId: item.id
                                            })
                                        }}> 
                                        <Text style = {{margin: 15, width: 100,}}>{item.hawkerId}</Text>
                                        <Text style = {{margin: 15, width: 100}}>{item.hawkerName}</Text>
                                        <Text style = {{margin: 15, width: 100}}>{item.address}</Text>
                                        <Text style = {{margin: 15, width: 150}}>{item.desc}</Text>
                                        <Text style = {{margin: 15, width: 120}}>{item.coordinate.latitude}</Text>
                                        <Text style = {{margin: 15, width: 120}}>{item.coordinate.longitude}</Text>
                                        <Image source = {{uri: item.image}} style = {{width: 70, height: 50, borderRadius: 3}}/>
                                    </TouchableOpacity>
                                )}
                        keyExtractor={ item => item.hawkerId } />
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
    }
})
