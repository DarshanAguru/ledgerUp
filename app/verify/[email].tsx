import { View, Text, StyleSheet, Alert } from 'react-native'
import React, { Fragment, useEffect, useState } from 'react'
import { Link, useLocalSearchParams } from 'expo-router'
import { isClerkAPIResponseError, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { defaultStyles } from '@/constants/Styles';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import Colors from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
const CELL_COUNT = 6;

const Page = () => {

    const { email, signin } = useLocalSearchParams<{ email : string; signin : string }>();
    const [code, setCode ] = useState("");
    const { signIn } = useSignIn();
    const { signUp, setActive } = useSignUp();

    const ref = useBlurOnFulfill({value: code , cellCount: CELL_COUNT})
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({value:code, setValue:setCode});

    useEffect(()=>{
        if(code.length === 6)
        {
           if(signin === "true")
           {
            verifySignIn();
           }
           else{
            verifycode();
           }
        }
    }, [code]);

    const verifycode = async()=>{
        try{
            await signUp!.attemptEmailAddressVerification({code});
            await setActive!({ session: signUp!.createdSessionId })
        }
        catch(err)
        {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            console.log("Error", JSON.stringify(err,null,2));
        if(isClerkAPIResponseError(err))
        {
          if(err.errors[0].code === 'form_identifier_not_found') {
            Alert.alert('Error',"Error");
          }
        } else{
            Alert.alert('Incorrect Code');
        }

        }

    }

    const verifySignIn = async()=>{
        try{
            await signIn!.attemptFirstFactor({strategy: 'email_code',code});
            await setActive!({ session: signIn!.createdSessionId })
        }
        catch(err)
        {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            console.log("Error", JSON.stringify(err,null,2));
        if(isClerkAPIResponseError(err))
        {
          if(err.errors[0].code === 'form_identifier_not_found') {
            Alert.alert('Error', "Error");
          }
        }
        else{
            Alert.alert('Incorrect Code');
        }
    }

    }

  return (
    <View style={defaultStyles.container}>
        <StatusBar style='dark'/>
      <Text style={defaultStyles.header}> 6-digit code</Text>
      <Text style={defaultStyles.descriptionText}> Code is sent to {email}</Text>

      <CodeField
        ref = {ref}
        {... props}
        value = {code}
        onChangeText = {setCode}
        cellCount={CELL_COUNT}
        rootStyle={styles.codeFieldRoot}
        keyboardType={'number-pad'}
        textContentType={'oneTimeCode'}
        renderCell={({index, symbol, isFocused})=>(
            <Fragment key={index}>
                <View onLayout={getCellOnLayoutHandler(index)} key={index} style={[styles.cellRoot, isFocused && styles.focusCell]}>
                    <Text style={styles.cellText}> {symbol || (isFocused ? <Cursor/> : null)} </Text>
                
                </View>
                {index === 2 ? <View key={`separator-${index}`} style={styles.separator}/>:null }
            </Fragment>
          
        )}
        />


    </View>
  )
}

const styles = StyleSheet.create({
    codeFieldRoot: {
        marginVertical: 20,
        marginLeft: 'auto',
        marginRight: 'auto',
        gap:12,
    },
    cellRoot: {
        width:  45,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.lightGray,
        borderRadius: 8,
    },
    cellText : {
        color: '#000',
        fontSize: 36,
        textAlign: 'center',
    },
    focusCell:{
        borderColor: '#000'
    },
    separator: {
        height: 2,
        width: 10,
        backgroundColor: Colors.gray,
        alignSelf: 'center'
    },
})

export default Page