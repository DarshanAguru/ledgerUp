import { View, Text, StyleSheet,  TouchableOpacity, Vibration } from 'react-native'
import React, { useCallback, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Colors from '@/constants/Colors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useUser } from '@clerk/clerk-expo';
import { Link, useFocusEffect } from 'expo-router'

const HeaderTabs = ( {tabName}:{tabName:string}) => {

  const { user } = useUser();

  const [userName , setUserName] = useState("");

    const { top } = useSafeAreaInsets();


    const HandleUser = ()=>{
      Vibration.vibrate(10);
      
    }

    useFocusEffect(useCallback(()=>{
      setUserName(`${(user?.firstName)?.at(0)?.toLocaleUpperCase()}${(user?.lastName)?.at(0)?.toLocaleUpperCase()}`);
    },[user]))


  return (
    <View  style={{ paddingTop: top}}>
      <GestureHandlerRootView style={styles.container}>
        <Link href="/(authenticated)/(modals)/account" asChild>
        <TouchableOpacity style={styles.roundBtn} onPress={()=>HandleUser()}>
                <Text style={{fontSize: 20, color: '#fff', fontWeight: 'bold'}}>{(user === null)?"TU":userName}</Text>
        </TouchableOpacity>
        </Link>
        <View style={styles.centerBar}>
        <Text style={{color: '#fff', fontWeight: '500', fontSize: 22, padding: 8}}>
                    {tabName}
        </Text>
        </View>
      </GestureHandlerRootView>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
        gap: 10,
        backgroundColor: 'transparent',
        paddingHorizontal: 20,
    },

    roundBtn: {
        padding: 10,
        borderRadius: 16,
        backgroundColor: Colors.dark,
        justifyContent: 'center',
        alignItems: 'center',
        
    },

    centerBar : {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: '#0f0f0f',

    }



});

export default HeaderTabs