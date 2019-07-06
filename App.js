import React from 'react';
import { StyleSheet, Text, View,ActivityIndicator,FlatList,Dimensions,Image,Animated,TouchableWithoutFeedback,TouchableOpacity,CameraRoll } from 'react-native';
import axios from 'axios';
import {Ionicons} from '@expo/vector-icons'
import {Permissions, FileSystem} from 'expo'

const {height,width} = Dimensions.get('window')
export default class App extends React.Component {
  constructor(){
    super()
    this.state = {
      isLogging : false,
      images : [],
      scale : new Animated.Value(1),
      isImageFocused : false
    }

    this.scale = {
      transform : [{scale:this.state.scale}]                                ////////////////////////////////////???///transform in style
    }

    this.actionBarY = this.state.scale.interpolate({
      inputRange : [0.9,1],
      outputRange : [0,-80]
    })

    this.borderRadios = this.state.scale.interpolate({
      inputRange : [0.9,1],
      outputRange : [30,0]
    })
    this.loadWallpaper = this.loadWallpaper.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }


  loadWallpaper(){
    axios.get('https://api.unsplash.com/photos/random?count=30&client_id=52878a4549b9b8f9e25500deffae8477002dc79ebb88f2cb17e717b8406f793c')
    .then(function(response){
      console.log(response.data);
      this.setState({images:response.data, isLogging:true});
    }.bind(this))
    .catch(function(error){
      console.log(error)
    }).finally(function(){
      console.log('request is completed')
    })
  }
  componentDidMount(){
    this.loadWallpaper()
  } 

  saveToCameraRoll = async(image) => {
    let cameraPermissions = await Permissions.getAsync(Permissions.CAMERA_ROLL);
    if(cameraPermissions.status !== 'granted'){
      cameraPermissions = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    }
    if(cameraPermissions.status === 'granted'){
      FileSystem.downloadAsync(image.urls.full,FileSystem.documentDirectory+image.id+'.jpg').then(({uri}) =>{
        CameraRoll.saveToCameraRoll(uri)
        alert('saved to photos')
      }).catch(error => {
        console.log(error)
      })
    }
    else{
      aleart('Reqiure camera roll permissions')
    }
  }
  
  showControls = (item) => {
    this.setState((state)=>({
      isImageFocused : !state.isImageFocused
    }),()=>{
      if(this.state.isImageFocused){
        Animated.spring(this.state.scale,{
          toValue : 0.9
        }).start()
      }
      else{
        Animated.spring(this.state.scale,{
          toValue : 1
        }).start()
      }
    })
  }

  shareWallpaper = async(image) => {
    try{
      await Share.share({
        message : 'Checkout this wallpaper' + image.urls.full
      })
    }catch (error){
      console.log(error);
    }
  }

  renderItem(image){
    return(
      <View style={{flex:1}}>
        <View style={{position:'absolute',left:0,right:0,top:0,bottom:0,backgroundColor:'black',justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator size='large' color='grey'/>
        </View>
        <TouchableWithoutFeedback onPress = {()=> this.showControls(image)}>
          <Animated.View style = {[{height,width},this.scale]}>
            <Animated.Image style = {{flex:1,height:null,width:null,borderRadius:this.borderRadios}} source = {{uri : image.urls.regular}}  />
          </Animated.View>
        </TouchableWithoutFeedback>
        <Animated.View style={{position:'absolute',left:0,right:0,flexDirection:'row',bottom:this.actionBarY,height:80,backgroundColor:'black'}}>
          <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
            <TouchableOpacity activeOpacity = {0.5} onPress = {()=>this.loadWallpaper()}>
              <Ionicons name="ios-refresh" color="white" size = {40} />
            </TouchableOpacity>
          </View>

          <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
            <TouchableOpacity activeOpacity = {0.5} onPress = {()=>this.shareWallpaper(image)}>
              <Ionicons name="ios-share" color="white" size = {40} />
            </TouchableOpacity>
          </View>

          <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
            <TouchableOpacity activeOpacity = {0.5} onPress = {()=>this.saveToCameraRoll(image)}>
              <Ionicons name="ios-save" color="white" size = {40} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
      
    )
  }


  render() {
    return this.state.isLogging ? (
    <View style={{flex:1,backgroundColor:'black'}}>
      <FlatList 
        scrollEnabled = {!this.state.isImageFocused}
        horizontal
        pagingEnabled
        data = {this.state.images}
        renderItem = {(({item})=>this.renderItem(item))}   ////////
        keyExtractor = {item => item.id}
      />
    </View>
    ):( 
      <View style={{flex:1,backgroundColor:'black',justifyContent : 'center',alignItems: 'center'}}>
        <ActivityIndicator size="large" color="grey" />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
