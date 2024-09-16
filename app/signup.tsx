import { View, Text, StyleSheet, TextInput, Touchable, Vibration, Alert, KeyboardAvoidingView } from 'react-native'
import React, { useState } from 'react'
import { defaultStyles } from '@/constants/Styles'
import Colors from '@/constants/Colors'
import { Link, useRouter } from 'expo-router'
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler'
import { useSignUp } from '@clerk/clerk-expo'
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'

const Page = () => {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");

  const router = useRouter();

  const { signUp } = useSignUp(); 

  const onSignUp = async() => {
    

    if(firstName.trim() === "" || lastName.trim() === "" || emailAddress.trim() === "")
    {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
       
    try{
      Vibration.vibrate(20);
      await signUp!.create({
        firstName: firstName,
        lastName: lastName,
        emailAddress:emailAddress
      });
      await signUp!.prepareEmailAddressVerification();
      // @ts-ignore
      router.push({pathname: '/verify/[email]', params:{email: emailAddress}});
    }
    catch(err){
      Alert.alert("Error", "Already registered with this email address? Try login");
      //  console.error("Error Signing up", err);
    }
  }


  return (

    <GestureHandlerRootView style={defaultStyles.container}>
     
      <StatusBar style='dark'/>
      <Text style={defaultStyles.header}>Let's get started</Text>
      <Text style={defaultStyles.descriptionText}>Enter your details and we'll send you a verification code at your email address</Text>
      <View style={styles.mainInputContainer}>
      <View style={{flexDirection: 'row', width: '100%',gap: 6, marginLeft: -5}}>
      <View style={[styles.inputContainer, {flex: 1}]}>
        <TextInput style={[styles.input, {width: '100%'}]} placeholder='First Name' placeholderTextColor={Colors.gray}  keyboardType='default' onChangeText={setFirstName} value={firstName}/>
      </View>
      <View style={[styles.inputContainer,{flex:1}]}>
        <TextInput style={[styles.input, {width: '100%'}]} placeholder='Last Name' placeholderTextColor={Colors.gray}  keyboardType='default' onChangeText={setLastName} value={lastName}/>
      </View>
      </View>
      <View style={[styles.inputContainer, {width: '100%', marginLeft: -5}]}>
        <TextInput style={[styles.input, {width : '100%'}]} placeholder='email Address' placeholderTextColor={Colors.gray}  keyboardType='default' onChangeText={setEmailAddress} value={emailAddress}/>
      </View>
      </View>
    

      <Link href={'/login'} replace asChild>
        <TouchableOpacity onPress={()=>{Vibration.vibrate(10);}}>
          <Text style={[defaultStyles.textLink, {fontSize:18,color: Colors.gray}]}>Already have an account?<Text style={{color: Colors.dark, fontSize:18}}> Login</Text></Text>
        </TouchableOpacity>
      </Link>

      <View style={{flex: 1}}/> 
      <TouchableOpacity style={[defaultStyles.pillButton,(firstName === "" || lastName === "" || emailAddress === "") ? styles.disabled:styles.enabled, {marginBottom: 20}]} onPress={onSignUp}>
        <Text style={defaultStyles.buttonText}>Sign up</Text>
      </TouchableOpacity>

   
    </GestureHandlerRootView>
     
  )
}


const styles = StyleSheet.create({
mainInputContainer: {
  marginTop:30,
  marginBottom:30,
  flexDirection: 'column',
  gap: 24,
  justifyContent: 'center',
  alignContent: 'center',
},
inputContainer: {
  flexDirection: 'row',
},

input : {
  backgroundColor: Colors.lightGray,
  padding: 20,
  borderRadius: 16,
  fontSize: 20,
  marginRight: 10
},

enabled: {
  backgroundColor: Colors.primary,
},

disabled : {
  backgroundColor: Colors.primaryMuted,
}

});

export default Page