import { View, Text, StyleSheet, TextInput, Touchable, Alert, Vibration } from 'react-native'
import React, { useState } from 'react'
import { defaultStyles } from '@/constants/Styles'
import Colors from '@/constants/Colors'
import { useRouter } from 'expo-router'
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler'
import { isClerkAPIResponseError, useSignIn } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar'

enum SignInType {
  Phone,
  Email 

}

const Page = () => {

  const [emailAddress, setEmailAddress] = useState("");

  const router = useRouter();
  const { signIn } = useSignIn();

  const onSignIn = async(type: SignInType) => {
    Vibration.vibrate(10);
    if (type === SignInType.Email) {
      try{

        const { supportedFirstFactors }  = await signIn!.create({
          identifier: emailAddress,
        });

        const firstPhoneFactor: any = supportedFirstFactors!.find((factor:any)=>{return factor.strategy ==='email_code';});

        const { emailAddressId } =  firstPhoneFactor;

        await signIn!.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId,
        })
        // @ts-ignore
        router.push({pathname: '/verify/[email]', params:{email: emailAddress, signin: 'true'}});
      }
      catch(err)
      {
        console.log("Error", JSON.stringify(err,null,2));
        if(isClerkAPIResponseError(err))
        {
          if(err.errors[0].code === 'form_identifier_not_found') {
            Alert.alert('Error', "error");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            
          }
        }

      }
    }
    
  }


  return (
    <GestureHandlerRootView style={defaultStyles.container}>
      <StatusBar style='dark'/>
      <Text style={defaultStyles.header}>Welcome back</Text>
      <Text style={defaultStyles.descriptionText}>Enter your email address associated with your account and we'll send you a verification code</Text>
      <View style={styles.inputContainer}>
        <TextInput style={[styles.input, {flex: 1}]} placeholder='Email Address' placeholderTextColor={Colors.gray}  keyboardType='default' onChangeText={setEmailAddress} value={emailAddress}/>
      </View>

      <View style={{flex: 1}}></View>

      <TouchableOpacity style={[defaultStyles.pillButton,emailAddress.trim() !== "" ? styles.enabled:styles.disabled, {marginBottom: 20}]} onPress={()=>onSignIn(SignInType.Email)}>
        <Text style={defaultStyles.buttonText}>Continue</Text>
      </TouchableOpacity>

    </GestureHandlerRootView>
  )
}


const styles = StyleSheet.create({
inputContainer: {
  marginVertical: 40,
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