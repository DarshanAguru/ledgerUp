import { View, Text, StyleSheet, Vibration, ActivityIndicator} from 'react-native'
import React from 'react'
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import { Link } from 'expo-router';
import Colors from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';

const Page = () => {



  return (
    <GestureHandlerRootView style={[styles.container]}>
      <StatusBar style={'light'}/>
   
      {
         <Image source={require('@/assets/images/image.png')} style={styles.video}/>
      }
     
        <View style={{marginTop: 80 ,padding: 20}}>
            <Text style={styles.header}>Struggling to keep track of your expenses?</Text>
        </View>

        <View style={styles.buttons}>
          <Link href={'/login'} style={{display:'flex', marginStart: 20, marginEnd: 20, backgroundColor: Colors.dark, padding: 6, borderRadius: 18,height: 60, alignItems:'center', justifyContent: 'center'}} asChild>
            <TouchableOpacity onPress={()=>{Vibration.vibrate(10);}}>
              <Text style={{color: 'white', fontSize: 22, fontWeight:'500'}}> Log in  </Text>
            </TouchableOpacity>
            </Link>
            <Link href={'/signup'} style={{display:'flex', marginStart: 20, marginEnd: 20, backgroundColor: '#fff', padding: 6, borderRadius: 18,height: 60, alignItems:'center', justifyContent: 'center'}} asChild>
            <TouchableOpacity onPress={()=>{Vibration.vibrate(10);}}>
              <Text style={{fontSize: 22, fontWeight:'500'}}> Sign up  </Text>
            </TouchableOpacity>
            </Link>
        </View>

    </GestureHandlerRootView>
  )
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  video:{
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  
  header: {
    fontSize: 34,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: 'white',
  },

  buttons: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 60,
  },

});

export default Page