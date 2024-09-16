import {  Text, StyleSheet, View, Vibration } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import Colors from '@/constants/Colors'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { StatusBar } from 'expo-status-bar'
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router'

const Page = () => {
  
  const { user } = useUser();
  const [userName, setUserName] =  useState("")
  const [lockIconName , setLockIconName] = useState('lock-closed-outline');
  const router = useRouter();

  const onBiometricAuthentication = async() => {
    try{

      const { success } = await LocalAuthentication.authenticateAsync({promptMessage: "Unlock LedgerUp"});
      if(success === true)
      {
        setLockIconName('lock-open-outline');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(()=>{if(router.canDismiss()) {router.dismissAll();} router.replace("/(authenticated)/(tabs)/home")},250);        
      }
      else{
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    catch (err)
    {
     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); 
    }
  }

  const handleOnPress = async()=>{
    Vibration.vibrate(10);
    onBiometricAuthentication();
  }

  useEffect(()=>{
    setUserName(`${user?.firstName}`)
  },[])

  return (
    <SafeAreaView style={{flex:1}}>
      <StatusBar style={'dark'}/>
      <Text style={styles.greeting}>Welcome, {userName}!</Text>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
        <TouchableOpacity style={styles.lockIcon} onPress={()=>handleOnPress()}>
          {/* @ts-ignore */}
        <Ionicons name={lockIconName} size={44} color={Colors.dark} />
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 80,
    alignSelf: 'center',
  },

  lockIcon:{
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#000",
    padding: 15,
    borderRadius: 16,
    flexDirection: 'row',
  }


})

export default Page