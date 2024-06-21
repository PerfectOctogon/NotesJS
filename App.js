import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import tw, { useDeviceContext } from 'twrnc';
import { useAddNoteMutation, useDeleteNoteMutation, useFetchNotesQuery, useSearchNotesQuery, useUpdateNoteMutation } from './db';
import { store } from './store';

//Daniel Flemming

const Stack = createNativeStackNavigator();

//This is the note object. Can be added dynamically
const Note = ({item, nav}) => {

  titleCalculator = () => {
    if(item.title.length >= 8){
      return item.title.substring(0, 8) + "..."
    }
    return item.title
  }

  contentCalculator = () => {
    if(item.content.length >= 8){
      return item.content.substring(0, 8) + "..."
    }
    return item.content
  }
  return (
    <TouchableOpacity onPress={() => {nav.navigate('Details', {note : item});}} style = {[tw`w-1/3 aspect-square mb-1 mr-1 p-5 rounded-lg bg-[#2F0082]`]}>
      <View>
        <Text style={tw`text-white text-4 font-bold pb-1`}>{titleCalculator()}</Text>
        <Text style={tw`text-white`}>{contentCalculator()}</Text>
      </View>
    </TouchableOpacity>
  );
}

// HomeScreen component handles the main functionality of adding, searching, and displaying notes
function HomeScreen({route, navigation}){
  const [addNote, {data : addNoteData}] = useAddNoteMutation();
  const {data, error, isLoading} = useFetchNotesQuery();
  const [text, setText] = useState("");
  const {data : filteredData, isLoading : searchNotesLoading} = useSearchNotesQuery(""+text);

  useEffect(() => {
    if(addNoteData != undefined){
      navigation.navigate('Details', {note : addNoteData});
      console.log(addNoteData);
    }
  }, [addNoteData])
  
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
      <View style={tw`items-center pb-5`}>
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

// DetailsScreen component handles the display, editing, and deletion of a single note
function DetailsScreen({route, navigation}){
  const [updateNote] = useUpdateNoteMutation();
  const {note} = route.params;
  const [title, setTitle] = useState(note.title);
  const [text, setText] = useState(note.content);
  const [deleteNote] = useDeleteNoteMutation();
  const deleteThisNote = () => {
    deleteNote(note);
    navigation.popToTop();
  }
  React.useEffect(() => {
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
    //updateNote({id : note.id, content : text, title : title});
    navigation.popToTop();
  }

  updateContent = (text) => {
    setText(text);
    updateNote({id : note.id, content : text, title : title});
  }

  updateTitle = (text) => {
    setTitle(title)
    updateNote({id : note.id, content : note.content, title : text});
  }


  return(
    <ScrollView style={tw`flex-1 bg-[#2F0082] p-2 h-screen`} automaticallyAdjustKeyboardInsets={true}>
      <TextInput style={tw`text-white bg-[#3d00a9]  w-full text-6 mb-5`} multiline={true} onChangeText={text => updateTitle(text)} placeholder='Type here'>{note.title}</TextInput>
      <TextInput style={tw`text-white bg-[#3d00a9] w-full`} multiline={true} onChangeText={text => updateContent(text)} placeholder='Type here'>{note.content}</TextInput>
      <TouchableOpacity style={tw`items-center pt-5`} onPress={saveNote}>
        <Text style={tw`font-bold text-white`}>DONE</Text>
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