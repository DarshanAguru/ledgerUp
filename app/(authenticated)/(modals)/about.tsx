import { View, Text, Vibration } from 'react-native'
import React from 'react'
import Colors from '@/constants/Colors'

const Page = () => {
  return (
    <View style={{flex: 1, backgroundColor:"#000000bc",justifyContent: "center", alignItems:"center"}}>
      <View style={{elevation: 10, alignItems : "center", backgroundColor : "#fff",borderRadius: 10, width :"90%",height:"70%",shadowColor: "#000", shadowOpacity :1, shadowOffset: {width: 10, height: 10}, shadowRadius: 10}}>
        <Text style={{fontSize: 24, fontWeight: "bold", color: Colors.dark, textAlign: "center", padding: 10}}> About </Text>
        <View style={{padding: 6, width:"92%"}}>
            <Text style={{fontSize: 20, color :Colors.dark, marginBottom:4 }}>

            Welcome to LedgerUp! 📱💰
            </Text>
            <Text style={{fontSize: 18, color :Colors.gray,  marginBottom:2}}>
            This personal finance management app helps you stay on top of your finances effortlessly.
            </Text>
            <Text style={{fontSize: 18, color :Colors.gray,  marginBottom:2}}>
            Login securely with Clerk 🔒 and enjoy peace of mind as all data is stored locally on your device using secure storage. 🛡️
            </Text>
            <Text style={{fontSize: 18, color :Colors.gray,  marginBottom:2}}>
            Built with React Native and Expo, this app is designed for smooth, mobile-first experience. 🚀 (Please note that data is stored in local cache and If you  clear the cache all data will be wiped out!)
            </Text>

            <Text style={{fontSize: 18, color :Colors.gray,  marginBottom:2}}>
            It's open-source and available for everyone on GitHub! 🧑‍💻 Feel free to check out the code at GitHub Repo
            </Text>
            <Text style={{fontSize: 18, color :Colors.gray,  marginBottom:2}}>
            [https://github.com/DarshanAguru/ledgerUpApp.git].
            </Text>
            <Text style={{fontSize: 18, color :Colors.gray, marginBottom:2}}>
            Got questions or feedback? Feel free to contact me at 📧: agurudf@gmail.com
            </Text>
            <Text style={{fontSize: 18, color :Colors.gray}}>
            Hope you enjoy using LedgerUp! 😊
            </Text>
        </View>
      </View>
    </View>
  )
}

export default Page