import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import tw, { useDeviceContext } from 'twrnc';
import { useAddNoteMutation, useDeleteNoteMutation, useFetchNotesQuery, useSearchNotesQuery, useUpdateNoteMutation } from './db';
import { store } from './store';

//Daniel Flemming

//const generateData = (count) => Array.from({length : count}, (_, i) => ({id : (i + 1).toString(), note : "Note number " + (i+1).toString()}));
//const data = generateData(0);

const Stack = createNativeStackNavigator();



//This is the note object. Can be added dynamically
const Note = ({item, nav}) => {
  return (
    <TouchableOpacity onPress={() => {nav.navigate('Details', {note : item});}} style = {[tw`w-1/3 aspect-square mb-1 mr-1 p-2 rounded-lg bg-[#2F0082]`]}>
      <View>
        <Text style={tw`text-white`}>{item.content}</Text>
      </View>
    </TouchableOpacity>
  );
}

function HomeScreen({route, navigation}){
  const [addNote] = useAddNoteMutation();
  const {data, error, isLoading} = useFetchNotesQuery();
  const [text, setText] = useState("");
  const {data : filteredData, isLoading : searchNotesLoading} = useSearchNotesQuery(""+text);
  
  if(isLoading || searchNotesLoading){
    return(
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if(error){
    return(
      <View style={tw`flex-1 justify-center items-center`}>
        <Text style={tw`text-white`}>Failed to load notes</Text>
      </View>
    );
  }

  return(
    <View style={tw`w-full h-screen flex-1 bg-[#1c004f]`}>
      <View style={tw`items-center border-b-2 border-white pb-5`}>
        <Text style={tw`justify-center text-white font-bold pb-3 pt-5`}>Search/Quick add</Text>
        <TextInput style={tw`w-4/5 h-6 bg-[#2F0082] text-white`} placeholder='Type here...' onChangeText={(text) => {setText(text)}}></TextInput>
      </View>
      <FlatList
        style={tw`w-full`}
        data = {filteredData}
        keyExtractor = {(item) => item.id}
        renderItem = {({item}) => <Note item={item} nav={navigation}/>}
        numColumns = {3}
        contentContainerStyle={tw`p-4`}
      />
      <TouchableOpacity style={tw`items-center justify-center pb-3`} onPress={async () => {await addNote({title : " ", content: ""+text});}}>
        <Image
          source = {require('./assets/add.png')}
          style={tw`w-15 h-15`}
        />
      </TouchableOpacity>
    </View>
  );
}

function DetailsScreen({route, navigation}){
  const [updateNote] = useUpdateNoteMutation();
  const {note} = route.params;
  const [text, setText] = useState(note.content);
  const [deleteNote] = useDeleteNoteMutation();
  const deleteThisNote = () => {
    deleteNote(note);
    navigation.popToTop();
  }
  React.useEffect(() => {
    // Use `setOptions` to update the button that we previously specified
    // Now the button includes an `onPress` handler to update the count
    navigation.setOptions({
      headerRight: () => 
      <TouchableOpacity style={tw`items-center justify-center pb-3`} onPress={deleteThisNote}>
        <Image
          source = {require('./assets/delete.png')}
          style={tw`w-10 h-10`}
        />
      </TouchableOpacity>
    });
  }, [navigation]);

  saveNote = () => {
    updateNote({id : note.id, content : text, title : " "});
    navigation.popToTop();
  }


  return(
    <ScrollView style={tw`flex-1 bg-[#2F0082] p-2 h-screen`} automaticallyAdjustKeyboardInsets={true}>
      <TextInput style={tw`text-white bg-[#3d00a9] w-full`} multiline={true} onChangeText={text => setText(text)} placeholder='Type here'>{note.content}</TextInput>
      <TouchableOpacity style={tw`items-center pt-5`} onPress={saveNote}>
        <Text style={tw`font-bold text-white`}>SAVE NOTE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function App() {
  useDeviceContext(tw);
  return (
    <Provider store={store}>
      <SafeAreaView style={tw`w-full h-screen`}>
      <NavigationContainer>
          <Stack.Navigator screenOptions={{headerStyle: {backgroundColor : '#120033'}, headerTitleStyle: {color: 'white'} }} initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} options={{headerShadowVisible:false}}/>
            <Stack.Screen name="Details" component={DetailsScreen} options={{ headerRight: () => 
            <TouchableOpacity style={tw`items-center justify-center pb-3`}>
              <Image
                source = {require('./assets/delete.png')}
                style={tw`w-10 h-10`}
              />
          </TouchableOpacity>, headerShadowVisible:false, headerTintColor: '#ffffff'}}/>
          </Stack.Navigator>
      </NavigationContainer>
      </SafeAreaView>
    </Provider>
  );
}

export default App;
