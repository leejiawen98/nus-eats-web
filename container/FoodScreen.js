import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator,
        ScrollView, Image } from 'react-native';
import firebaseDb from '../firebaseDb'

export default class FoodScreen extends React.Component {
    state = {
        isLoading: true,
        food: null
    }

    componentDidMount() { 
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.retrieveAllFood()
        });
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    retrieveAllFood = () => {
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
            results.sort(   
                (a,b) => new Number(a.foodId.substring(1)) - new Number(b.foodId.substring(1)))
            this.setState({isLoading: false, food: results})
        }).catch(err => console.error(err)) 
    }

    render () {
        const { food, isLoading } = this.state

        if (isLoading) 
            return <ActivityIndicator style = {{alignSelf: 'center', flex: 1}} size = 'large' color= 'tomato' />

        return (
            <ScrollView>
                <View style = {styles.container}>
                    <View style = {{flexDirection: 'row'}}>
                        <Text style = {{fontSize: 25, marginBottom: 10, flex: 20}}>Food</Text>
                        <TouchableOpacity style = {{alignSelf: 'center', flex: 1}}
                            onPress = {() => this.props.navigation.navigate('Add Food')}>
                            <Text style = {{color: 'tomato', fontSize: 20}}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    <View style = {{height: 1, backgroundColor: '#DCDCDC', marginBottom:10}}/>
                    <View>
                        <FlatList 
                                style = {{borderRadius: 5}}
                                data={food} 
                                ListHeaderComponent = {() => (
                                    <View style = {{flexDirection: 'row', padding: 10,}}>
                                        <Text style = {styles.text}>Food ID</Text>
                                        <Text style = {styles.text}>Food Name</Text>
                                        <Text style = {styles.text}>Stall ID</Text>
                                        <Text style = {styles.text}>Price ($)</Text>
                                        <Text style = {styles.text}>Rating</Text>
                                        <Text style = {{margin: 15, width: 150, fontWeight: 'bold'}}>Description</Text>
                                        <Text style = {styles.text}>Image</Text>
                                    </View>   
                                )}
                                renderItem={ ({ item }) => (
                                    <TouchableOpacity style = {styles.hawkerButton} 
                                        onPress = {() => {
                                            this.props.navigation.navigate('Update Food', {
                                                stallId: item.stallId,
                                                foodId: item.foodId,
                                                foodName: item.foodName,
                                                price: item.price,
                                                rating: item.overallFoodRating,
                                                desc: item.desc,
                                                image: item.image,
                                                refId: item.id
                                            })
                                        }}>
                                        <Text style = {{margin: 15, width: 100,}}>{item.foodId}</Text>
                                        <Text style = {{margin: 15, width: 100}}>{item.foodName}</Text>
                                        <Text style = {{margin: 15, width: 100,}}>{item.stallId}</Text>
                                        <Text style = {{margin: 15, width: 100}}>{"$"}{Number(item.price).toFixed(2)}</Text>
                                        <Text style = {{margin: 15, width: 100}}>{item.overallFoodRating}</Text>
                                        <Text style = {{margin: 15, width: 150}}>{item.desc}</Text>
                                        <Image source = {{uri: item.image}} style = {{width: 100, height: 50, borderRadius: 3, margin: 15}}/>
                                    </TouchableOpacity>
                                )}
                        keyExtractor={ item => item.foodId } />
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
