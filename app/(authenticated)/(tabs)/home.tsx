import { View, Text, StyleSheet, Vibration, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import RoundButtons from '@/components/RoundButtons';
import { useBalanceStore } from '@/store/balanceStore';
import {  FontAwesome6, Ionicons } from '@expo/vector-icons';
import WidgetList from '@/components/WidgetsTiles/WidgetList';
import { useHeaderHeight } from '@react-navigation/elements';
import { StatusBar } from 'expo-status-bar';
import { Link, useFocusEffect } from 'expo-router';
import { useCategoryStore } from '@/store/categoryListStore';


const Page = () => {

  const { balance , transactions, deleteTransaction } = useBalanceStore();

  const [transacs, setTrans] = useState<any>([]);
  
  const headerHeight = useHeaderHeight();

  const {getCatCol} = useCategoryStore();


  useFocusEffect(useCallback(()=>{
    const daysDiff = (d1:string,d2:string)=>{
      const date1 = new Date(d1).valueOf();
      const date2 = new Date(d2).valueOf(); 
      const td = Math.abs(date2-date1);
      const dd = Math.ceil(td/(1000*60*60*24));
      return dd;
  }
   const needToDelete = transactions.filter((trans)=>(daysDiff(trans.date, new Date().toISOString()) > 90))
    needToDelete.forEach((trans)=>{
      deleteTransaction(trans.id);
    });

    setTrans(transactions);
  },[]))




  const [editPressed, setEditPressed] = useState(false);

  const onAddIncome = () => {Vibration.vibrate(10); 
};
  const onAddExpense = () => {Vibration.vibrate(10); 
};


  return (
    <ScrollView style={{backgroundColor: Colors.background}} contentContainerStyle={{paddingTop: headerHeight-200}}>
      <StatusBar style='dark'/>
      <View style={styles.account}>
        <View style={styles.row}>
          <Text style={styles.currency}>₹</Text>
          <Text style={[styles.balance, {color: (balance() < 0 )? "red" : Colors.dark}]}>{balance()}</Text>

        </View>
        <Text style={{position: 'absolute',color: Colors.lightGray, fontSize: 36,alignSelf: 'center', top:50, letterSpacing:2,fontWeight: '500', opacity: 0.4}}>Balance</Text>

      </View>
      <View style={{flexDirection: 'column',alignItems: 'center', justifyContent: 'center'}}>
      <GestureHandlerRootView style={styles.actionRow}>
        <Link href="/(authenticated)/(modals)/addIncome" asChild>
        <RoundButtons icon={'add'} text={'Income'} onPress={onAddIncome}/>
        </Link>
        <Link href="/(authenticated)/(modals)/addExpense" asChild>
        <RoundButtons icon={'remove-outline'} text={'Expense'} onPress={onAddExpense}/>
        </Link>
      </GestureHandlerRootView>
      </View>

      <View style={{flexDirection: "row",width:"90%", alignItems: "center"}}>
      <Text style={[defaultStyles.sectionHeader, {flex:1}]}>Snapshot</Text>
      <TouchableOpacity onPress={()=>{Vibration.vibrate(5); setEditPressed((prev)=>(!prev))}} style={{alignItems:"center"}}>
        <FontAwesome6 name={'edit'} size={20} color={(editPressed)?Colors.gray:Colors.lightGray}/>
      </TouchableOpacity>
      </View>
      <WidgetList isPressed={editPressed}/>

      <Text style={[defaultStyles.sectionHeader,{marginTop:-10}]}>
        Recent Transactions
      </Text>
      <View style={styles.transactions}>
        {transacs.length === 0 && <Text style={{padding: 8, color: Colors.gray}}>No Transactions yet</Text>}
        {
          transacs.length !== 0 && (transacs.sort((a:any,b:any)=>(new Date(b.date).valueOf() - new Date(a.date).valueOf())).slice(0,5).map((trans:any)=>{
            const date = new Date(trans.date);
            return (
              <View key = {trans.id} style={{flexDirection: 'row', marginBottom: 4,alignItems: 'center', gap:16}}>
              <View style={[styles.circle, {backgroundColor: getCatCol(trans.category)}]}>
                <View style={[styles.circle, {backgroundColor: "#fff",width: 20, height:20, borderRadius: 10, alignItems: 'center', justifyContent: 'center'}]}>
                  <Ionicons name={trans.type === 'income' ? 'add' : 'remove'} size={20} color={Colors.dark}/>
                </View>
                </View>
                <View style={{flex: 1}}>
                  <Text style={{fontWeight :'bold', fontSize: 14}}>{trans.title}</Text>
                  <View style={{flexDirection: "column"}}>
                  <Text style={{fontSize: 10, color: Colors.gray}}>{`${date.getDate().toString().padStart(2,"0")}/${(date.getMonth()+1).toString().padStart(2,"0")}/${date.getFullYear()}, ${date.toString().split(' ')[0]}`}</Text>
                  <Text style={{width:"100%", textAlign: "left",borderRadius:4 ,fontSize: 11, fontWeight: "bold", color: getCatCol(trans.category)}}>{trans.category}</Text>
                  </View>
                </View>
                <Text style={trans.type === "income" ? {color: 'green'} : {color: 'red'}}>{trans.type === 'income'?'+ ':'- '}₹{trans.amount}</Text>
            </View>)
        }))
        }
        
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
account : {
  margin: 25,
  alignItems: 'center'
},

row : {
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'center',
  gap:8,
  marginBottom: 25,

},

balance: {
  fontSize: 48, 
  fontWeight: 'bold',
},

currency: {
  fontSize: 28,
  fontWeight: '500',
},

actionRow: {
  width: '65%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: 12,
},


transactions: {
  marginHorizontal: 20,
  padding:14, 
  backgroundColor: '#fff',
  borderRadius: 16,
  gap: 18,
  marginBottom: 75,
},

circle : {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: Colors.lightGray,
  justifyContent: 'center',
  alignItems: 'center',
}

})

export default Page