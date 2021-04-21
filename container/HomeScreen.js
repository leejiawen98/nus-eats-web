import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import firebaseDb from '../firebaseDb'
import Ionicons from 'react-native-vector-icons/Ionicons';

export default class HomeScreen extends React.Component {
    state = {
        isLoading: true,
        hawkers: null,
        stalls: [],
        food: [],
        selectedHawker: null,
        selectedStall: null,
        loadingStall: true,
        selectedFood: null,
        loadingFood: true,

        locationStyle: 'ios-radio-button-off',
        restaurants: null,
        stallsTemp: null,
        foodTemp: null,

        hawkerStyle: styles.hawkerItemsOn,
        hawkerButton: false,
    }

    componentDidMount() { 
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.retrieveHawkers()
            this.retrieveRestaurant()
            this.retrieveStalls()
            this.retrieveMenu()
            // this.setState({
            //     food: [], 
            //     stalls: [], 
            //     selectedHawker: null,
            //     selectedStall: null,
            //     selectedFood: null,
            //     loadingStall: true,
            //     loadingFood: true
            // })
        });
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    retrieveHawkers = () => {
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
            this.setState({hawkers: results, isLoading: false})
            // this.retrieveStalls()
        }).catch(err => console.error(err)) 
    }

    retrieveRestaurant = () => {
        firebaseDb
        .firestore()
        .collection('stall')
        .get()
        .then(querySnapshot => {
            const results = []
            querySnapshot.forEach(doc => {
                if (doc.data().hawkerId == 'H07') {
                    results.push(doc.data())
                }
            })
            this.setState({restaurants: results})
        }).catch(err => console.error(err)) 
    }

    retrieveStalls = () => {
        firebaseDb
        .firestore()
        .collection('stall')
        .get()
        .then(querySnapshot => {
            const results = []
            querySnapshot.forEach(doc => {
                if (doc.data().hawkerId != 'H07') {
                    results.push({
                        ...doc.data(),
                        id: doc.id
                    })
                }
            })
            this.setState({stallsTemp: results})
        }).catch(err => console.error(err)) 
    }

    retrieveMenu = () => {
        firebaseDb
        .firestore()
        .collection('food')
        .get()
        .then(querySnapshot => {
            const results = []
            querySnapshot.forEach(doc => {
                results.push({
                    ...doc.data(),
                    id: doc.id
                })
            })
            this.setState({foodTemp: results})
        }).catch(err => console.error(err)) 
    }

    filterStalls = (item) => {
        let results = []
        if (this.state.stallsTemp != null )
        for (var i = 0; i < Object.keys(this.state.stallsTemp).length; i++){
            if (this.state.stallsTemp[i].hawkerId == item.hawkerId) {
                results.push(this.state.stallsTemp[i])
            }
        }
        this.setState({stalls: results, food: [], selectedHawker: item, loadingFood: true, loadingStall: true,})
    }

    filterMenu = (item) => {
        let results = []
        if (this.state.foodTemp != null )
        for (var i = 0; i < Object.keys(this.state.foodTemp).length; i++){
            if (this.state.foodTemp[i].stallId == item.stallId) {
                results.push(this.state.foodTemp[i])
            }
        }
        this.setState({food: results, selectedStall: item, loadingStall: false, loadingFood: true})
    }

    convertTime = (date) => {
        let hour = new Date(date.toDate()).getHours() * 100
        let min = new Date(date.toDate()).getMinutes()
        return (hour + min) > 1000 ? hour + min : '0' + (hour+min)
    }

    setSelectedFood = (item) => {
        this.setState({ selectedFood: item, loadingFood: false,})
    }

    changeType = () => {
        const { locationStyle, stallsTemp, restaurants } = this.state

        if (locationStyle == 'ios-radio-button-on') {
            this.setState({ locationStyle: 'ios-radio-button-off', stalls: stallsTemp, hawkerStyle: styles.hawkerItemsOn, hawkerButton: false})
        } else {
            this.setState({ locationStyle: 'ios-radio-button-on', stalls: restaurants, hawkerStyle: styles.hawkerItemsOff, hawkerButton: true, food: []})
        }
    }

    render () {
        const { isLoading, hawkers, stalls, food, selectedHawker, selectedStall, selectedFood, loadingStall, loadingFood,
            locationStyle, hawkerStyle, hawkerButton } = this.state

        if (isLoading) 
            return <ActivityIndicator style = {{alignSelf: 'center', flex: 1}} size = 'large' color= 'tomato' />

        return (
            <View style = {styles.container}>
                <View style = {{flexDirection: 'row', flex: 2}}>
                    <View style = {styles.button}>
                        <Text style = {{margin: 15, fontWeight: 'bold'}}>Hawker Centres</Text>
                        <View style = {{height: 1, backgroundColor: '#DCDCDC', marginBottom:10}}/>
                        <FlatList 
                            style = {{borderRadius: 5}}
                            data={hawkers} 
                            renderItem={ ({ item }) => (
                                <TouchableOpacity style = {hawkerStyle}
                                onPress = {() => this.filterStalls(item)}
                                disabled = {hawkerButton}
                                > 
                                    <Text style = {styles.text}>{item.hawkerName}</Text>
                                </TouchableOpacity>
                            )}
                        keyExtractor={ item => item.hawkerId } />
                    </View>
                    <View style = {styles.button}>
                        <View style = {{flexDirection: 'row'}}>
                            <Text style = {{margin: 15, fontWeight: 'bold', flex: 2}}>Stalls</Text>
                            <TouchableOpacity style = {{flexDirection: 'row', alignItems: 'center', flex: 1}}
                                onPress = {() => this.changeType()}>
                                <Ionicons name = {locationStyle} color = 'tomato'/>
                                <Text style = {{marginLeft: 5}}>Restaurants</Text>
                            </TouchableOpacity>
                        </View>
                        <View style = {{height: 1, backgroundColor: '#DCDCDC', marginBottom:10}}/>
                        <FlatList 
                            style = {{borderRadius: 5}}
                            data={stalls} 
                            extraData = {this.state}
                            renderItem={ ({ item }) => (
                                <TouchableOpacity style = {{backgroundColor: 'white', borderWidth: 1, borderColor: '#DCDCDC'}}
                                onPress = {() => this.filterMenu(item)}
                                > 
                                    <Text style = {styles.text}>{item.stallName}</Text>
                                </TouchableOpacity>
                            )}
                        keyExtractor={ item => item.stallId } />
                    </View>
                    <View style = {styles.button}>
                        <Text style = {{margin: 15, fontWeight: 'bold'}}>Menu</Text>
                        <View style = {{height: 1, backgroundColor: '#DCDCDC', marginBottom:10}}/>
                        <FlatList 
                            style = {{borderRadius: 5}}
                            data={food} 
                            renderItem={ ({ item }) => (
                                <TouchableOpacity style = {{backgroundColor: 'white', borderWidth: 1, borderColor: '#DCDCDC'}}
                                onPress = {() => this.setSelectedFood(item)}
                                > 
                                    <Text style = {styles.text}>{item.foodName}</Text>
                                </TouchableOpacity>
                            )}
                        keyExtractor={ item => item.foodId } />
                    </View>
                </View>
                <View style = {{flex: 1}}>
                    <Text style = {{fontSize: 20}}>Content</Text>
                    <View style = {{height: 1, backgroundColor: '#DCDCDC', marginBottom:10}}/>
                    
                    { selectedHawker && loadingStall &&
                    <View>
                        <View style = {{flexDirection: 'row', padding: 10,}}>
                            <Text style = {styles.contentText}>Hawker ID</Text>
                            <Text style = {styles.contentText}>Hawker Name</Text>
                            <Text style = {styles.contentText}>Location</Text>
                            <Text style = {{margin: 15, width: 150, fontWeight: 'bold'}}>Description</Text>
                            <Text style = {{margin: 15, width: 120, fontWeight: 'bold'}}>
                                Coordinates (1){"\n"}
                                Latitude
                            </Text>
                            <Text style = {{margin: 15, width: 120, fontWeight: 'bold'}}>
                                Coordinates (2){"\n"}
                                Longitude
                            </Text>
                            <Text style = {styles.contentText}>Image</Text>
                        </View> 
                        <TouchableOpacity style = {styles.hawkerButton} 
                            onPress = {() => {
                                this.props.navigation.navigate('Update Hawker', {
                                    hawkerId: selectedHawker.hawkerId,
                                    hawkerName: selectedHawker.hawkerName,
                                    address: selectedHawker.address,
                                    desc: selectedHawker.desc,
                                    coordinate: selectedHawker.coordinate,
                                    image: selectedHawker.image,
                                    refId: selectedHawker.id
                                })
                            }}> 
                            <Text style = {{margin: 15, width: 100,}}>{selectedHawker.hawkerId}</Text>
                            <Text style = {{margin: 15, width: 100}}>{selectedHawker.hawkerName}</Text>
                            <Text style = {{margin: 15, width: 100}}>{selectedHawker.address}</Text>
                            <Text style = {{margin: 15, width: 150}}>{selectedHawker.desc}</Text>
                            <Text style = {{margin: 15, width: 120}}>{selectedHawker.coordinate.latitude}</Text>
                            <Text style = {{margin: 15, width: 120}}>{selectedHawker.coordinate.longitude}</Text>
                            <Image source = {{uri: selectedHawker.image}} style = {{width: 70, height: 50, borderRadius: 3}}/>
                        </TouchableOpacity>
                    </View>
                    }

                    { !loadingStall && loadingFood &&
                    <View>
                        <View style = {{flexDirection: 'row', padding: 10,}}>
                            <Text style = {styles.contentText}>Stall ID</Text>
                            <Text style = {styles.contentText}>Stall Name</Text>
                            <Text style = {styles.contentText}>Hawker ID</Text>
                            <Text style = {styles.contentText}>Location</Text>
                            <Text style = {styles.contentText}>Rating</Text>
                            <Text style = {styles.contentText}>Opening Time</Text>
                            <Text style = {styles.contentText}>Closing Time</Text>
                            <Text style = {{margin: 15, width: 200, fontWeight: 'bold'}}>Coordinate (Latitude, Longitude)</Text>
                            <Text style = {styles.contentText}>Image</Text>
                            <Text style = {{margin: 15, width: 150, fontWeight: 'bold'}}>Creation Date</Text>
                        </View> 
                        <TouchableOpacity style = {styles.hawkerButton} 
                            onPress = {() => {
                                this.props.navigation.navigate('Update Stall', {
                                    stallId: selectedStall.stallId,
                                    stallName: selectedStall.stallName,
                                    hawkerId: selectedStall.hawkerId,
                                    address: selectedStall.address,
                                    rating: selectedStall.overallStallRating,
                                    openingHours: selectedStall.monTofriOpening,
                                    closingHours: selectedStall.monTofriClosing,
                                    cuisineType: selectedStall.cuisineType,
                                    image: selectedStall.image,
                                    creationDate: selectedStall.creationDate,
                                    coordinate: selectedStall.coordinate,
                                    refId: selectedStall.id
                                })
                            }}> 
                            <Text style = {{margin: 15, width: 100,}}>{selectedStall.stallId}</Text>
                            <Text style = {{margin: 15, width: 100}}>{selectedStall.stallName}</Text>
                            <Text style = {{margin: 15, width: 100,}}>{selectedStall.hawkerId}</Text>
                            <Text style = {{margin: 15, width: 100}}>{selectedStall.address}</Text>
                            <Text style = {{margin: 15, width: 100}}>{selectedStall.overallStallRating}</Text>
                            <Text style = {{margin: 15, width: 100}}>{this.convertTime(selectedStall.monTofriOpening)}</Text>
                            <Text style = {{margin: 15, width: 100}}>{this.convertTime(selectedStall.monTofriClosing)}</Text>
                            {selectedStall.hawkerId == 'H07' ? 
                            <View>
                            <Text style = {{margin: 15, width: 100}}>{ selectedStall.coordinate.latitude}</Text>
                            <Text style = {{margin: 15, width: 100}}>{ selectedStall.coordinate.longitude}</Text>
                            </View>
                            :
                            <Text style = {{margin: 15, width: 150}}>{ "Refer to Hawker's Coordinates" }</Text>
                            }
                            <Image source = {{uri: selectedStall.image}} style = {{width: 100, height: 50, borderRadius: 3, margin: 15}}/>
                            <Text style = {{margin: 15, width: 150}}>{new Date(selectedStall.creationDate.toDate()).toString()}</Text>
                        </TouchableOpacity>
                    </View>
                    }

                    { !loadingFood &&
                    <View>
                        <View style = {{flexDirection: 'row', padding: 10,}}>
                            <Text style = {styles.contentText}>Food ID</Text>
                            <Text style = {styles.contentText}>Food Name</Text>
                            <Text style = {styles.contentText}>Stall ID</Text>
                            <Text style = {styles.contentText}>Price ($)</Text>
                            <Text style = {styles.contentText}>Rating</Text>
                            <Text style = {{margin: 15, width: 150, fontWeight: 'bold'}}>Description</Text>
                            <Text style = {styles.contentText}>Image</Text>
                        </View>   
                        <TouchableOpacity style = {styles.hawkerButton} 
                            onPress = {() => {
                                this.props.navigation.navigate('Update Food', {
                                    stallId: selectedFood.stallId,
                                    foodId: selectedFood.foodId,
                                    foodName: selectedFood.foodName,
                                    price: selectedFood.price,
                                    rating: selectedFood.overallFoodRating,
                                    desc: selectedFood.desc,
                                    image: selectedFood.image,
                                    refId: selectedFood.id
                                })
                            }}>
                            <Text style = {{margin: 15, width: 100,}}>{selectedFood.foodId}</Text>
                            <Text style = {{margin: 15, width: 100}}>{selectedFood.foodName}</Text>
                            <Text style = {{margin: 15, width: 100,}}>{selectedFood.stallId}</Text>
                            <Text style = {{margin: 15, width: 100}}>{selectedFood.price}</Text>
                            <Text style = {{margin: 15, width: 100}}>{selectedFood.overallFoodRating}</Text>
                            <Text style = {{margin: 15, width: 150}}>{selectedFood.desc}</Text>
                            <Image source = {{uri: selectedFood.image}} style = {{width: 100, height: 50, borderRadius: 3, margin: 15}}/>
                        </TouchableOpacity>
                    </View>
                    }
                </View>
            </View>
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
        flex: 1,
        marginHorizontal: 10
    },
    text: {
        margin: 15
    },
    hawkerButton: {
        backgroundColor: '#00000010',
        borderRadius: 5,
        padding: 10,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#00000010'
    },
    contentText: {
        margin: 15,
        width: 100,
        fontWeight: 'bold'
    },
    hawkerItemsOff: {
        backgroundColor: '#00000000', 
        borderWidth: 1, 
        borderColor: '#DCDCDC'

    },
    hawkerItemsOn: {
        backgroundColor: 'white', 
        borderWidth: 1, 
        borderColor: '#DCDCDC'
    }
})
