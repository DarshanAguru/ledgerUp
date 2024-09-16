import { View, Text } from 'react-native'
import React from 'react'
import Colors from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'



const  Page= () => {
  return (
    <View style={{flex:1,padding:20, alignItems:'center', justifyContent: 'center', backgroundColor: "white"}}>
      <Ionicons name={'eye-off-outline'} size={80} color={Colors.gray}/>
      <Text style={{fontSize: 26,letterSpacing: 6, textAlign: "center", color: Colors.gray}}>Hidden</Text>
    </View>
  )
}

export default Page