import { View, Text, StyleSheet,  TouchableOpacity, Vibration } from 'react-native'
import React, { useCallback, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Colors from '@/constants/Colors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useUser } from '@clerk/clerk-expo';
import { Link, useFocusEffect } from 'expo-router'
import { useBalanceStore } from '@/app/store/balanceStore'

const HeaderTabs = () => {

  const { user } = useUser();

  const [userName , setUserName] = useState("");

    const { top } = useSafeAreaInsets();

    const { getTotalExpenseThisMonth, getTotalIncomeThisMonth } = useBalanceStore();

    const [iet, setIet] = useState<{income:number,expense:number}>({income:0, expense:0});

  


    const HandleUser = ()=>{
      Vibration.vibrate(10);
      
    }

    useFocusEffect(useCallback(()=>{
      setUserName(`${(user?.firstName)?.at(0)?.toLocaleUpperCase()}${(user?.lastName)?.at(0)?.toLocaleUpperCase()}`);
      
      const inc = getTotalIncomeThisMonth();
      const exp = getTotalExpenseThisMonth();
      if(inc === 0 && exp === 0)
      {
        setIet({income: 0, expense: 0});
      }
      else{
        
        if(exp  == 0)
        {
          setIet({income:100,expense: 0})
        }
        else if(inc == 0)
        {
          setIet({income: 0, expense: 100})
        }
        else
        {
          const balPerc = (exp/inc)*100;
          if(balPerc >  100)
          {
            setIet({income: 0, expense: 100})
          }
          else{
            setIet({income:100-balPerc,expense: balPerc})
          }
        }
      }
   

     
    },[user]))


  return (
    <View  style={{ paddingTop: top}}>
      <GestureHandlerRootView style={styles.container}>
        <Link href="/(authenticated)/(modals)/account" asChild>
        <TouchableOpacity style={styles.roundBtn} onPress={()=>HandleUser()}>
                <Text style={{fontSize: 20, color: '#fff', fontWeight: 'bold'}}>{(user === null)?"TU":userName}</Text>
        </TouchableOpacity>
        </Link>
        <View  style={{flex:1, borderColor: "#000", borderWidth : StyleSheet.hairlineWidth, alignItems:"center",borderRadius: 10, paddingVertical:4}}>
          <View style={{flexDirection:"row", width:"100%", paddingLeft:4, paddingRight: 6, height:"60%", gap:2}}>
          <View style={{backgroundColor: "#00dd0030", borderTopLeftRadius: 8, borderBottomLeftRadius: 8,borderTopRightRadius: (iet.expense > 0)?2:8, borderBottomRightRadius: (iet.expense > 0)?2:8,width:`${iet.income}%`}}/>
          <View style={{backgroundColor:"#dd000030", borderTopRightRadius: 8, borderBottomRightRadius: 8,borderTopLeftRadius: (iet.income > 0)?2:8, borderBottomLeftRadius: (iet.income > 0)?2:8,width:`${iet.expense}%`}}/>
          </View>
          
          <View style={{position:"absolute", width:"100%"}}>
          <Text style={{textAlign:"center", fontSize:24, width:"100%",fontWeight:"900", fontStyle:"italic", fontFamily:"cursive"}}>LedgerUp</Text>
          </View>
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
        backgroundColor: Colors.background,
        paddingHorizontal: 20,
    },

    roundBtn: {
        padding: 9,
        borderRadius: 30,
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