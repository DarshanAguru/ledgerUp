import React from "react";
import { StyleSheet, View, Text, Vibration } from "react-native";


import { MARGIN, SIZE } from "./Config";
import { useBalanceStore } from "@/app/store/balanceStore";
import Colors from "@/constants/Colors";
import {  PieChart} from "react-native-gifted-charts";

import {  useRouter } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useCategoryStore } from "@/app/store/categoryListStore";


const styles = StyleSheet.create({
  container: {
   width: SIZE-15,
   height:150,
   backgroundColor: 'white',
   borderRadius: 20,
   shadowColor: '#000',
   shadowOffset: {width: 0, height: 1},
   shadowOpacity: 0.4,
   shadowRadius: 2,
   elevation: 5,
   padding: 14,
   alignSelf: 'center',
  },
});
interface TileProps {
  id: string;
  onLongPress: () => void;
}

const Tile = ({ id }: TileProps) => {

  const { filterTransactions,getTotalExpenseThisMonth, getTotalIncomeThisMonth } = useBalanceStore();

  const router = useRouter();

  const {getCatCol} = useCategoryStore();

  

  const DATA = ()=>{
    

    
    const transactionsThisMonth = filterTransactions({duration: 'month'});
    
    
    if(transactionsThisMonth===null || transactionsThisMonth!.length === 0) return null;
    const mapByCategory:Map<string,number> = new Map();
    let totalAmount = 0;
    for(let i=0; i<transactionsThisMonth!.length; i++)
    {
      const trans = transactionsThisMonth![i];
      if(trans.type === "expense")
      {
      if(!mapByCategory.get(trans.category)) mapByCategory.set(trans.category, trans.amount);
      else {
        const amt = mapByCategory.get(trans.category)!;
        mapByCategory.set(trans.category, amt+trans.amount);
      }
      totalAmount += trans.amount;
    }
    }
    const dataList:any = []
    mapByCategory.forEach((v,k)=>{
      dataList.push({strokeWidth:1,strokeColor: "#fff",value: Math.round((Number(v)/totalAmount)*10000)/100 , color: getCatCol(k)})
    });
    dataList.sort((a:any,b:any)=>(a.value < b.value) ? 1 : -1);
    return dataList;
    }
  

    const data = DATA();
    

  const getEIratio = () => {
   let ebi = Number((getTotalExpenseThisMonth()/getTotalIncomeThisMonth()).toFixed(2));
   if(Number.isNaN(ebi)) return null;
   if(ebi === Infinity) return null;
   ebi = Math.round(ebi*100)/100;
    return (ebi*100);
  }
  
  if(id === 'income')
  {
      return (
        <View style={styles.container} pointerEvents="none">
            <Text style={{color: Colors.gray, fontWeight: '400', fontSize: 16}}><Text style={{color: 'green', fontWeight: '500', fontSize: 16}}>Income</Text> this month</Text>
            <View style={{alignItems: 'center', justifyContent: 'center', flex:1}}>
            <View style={{borderRadius: 20, borderColor: 'green', paddingHorizontal: 8, paddingVertical: 16,  borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{color: Colors.dark, fontWeight: 'bold', fontSize: 20}}>₹{getTotalIncomeThisMonth()}</Text>
            </View>
            </View>

        </View>
      );
    
  }

  if(id === 'spentChart')
    {
        return (
          <View style={styles.container}>
            
              <Text style={{color: Colors.gray, fontWeight: '500', fontSize: 16}}>Spends</Text>
              <View style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 10}}>
                {/* chart */}
                <TouchableOpacity onPress={()=>{Vibration.vibrate(10);router.push('/analysis')}}>
                {(data === null || data.length <= 0) && <Text style={{color: Colors.dark, fontWeight: 'bold',marginVertical: 15, fontSize: 24}}> No Spends</Text>}
                {
                  (data !== null && data.length > 0)  &&  
                  <View style={{width: 90, height:80}}>
                  {/* @ts-ignore */}
                  <PieChart
              data={data!}
              radius={42}
              backgroundColor="#fff"
              donut
              showGradient
              gradientCenterColor='#ffffff'
              innerRadius={24}
              innerCircleColor={"#ffffff"}
              />
                  </View>  
                
                }
                </TouchableOpacity>
              </View>
              
          </View>
        );
      
    }

  if(id === 'expense')
    {
        return (
          <View style={styles.container} pointerEvents="none">
               <Text style={{color: Colors.gray, fontWeight: '400', fontSize: 16}}><Text style={{color: 'red', fontWeight: '500', fontSize: 16}}>Spends</Text> this month</Text>
            <View style={{alignItems: 'center', justifyContent: 'center', flex:1}}>
            <View style={{ borderRadius: 20, borderColor: 'red', paddingHorizontal: 8, paddingVertical: 16,  borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{color: Colors.dark, fontWeight: 'bold', fontSize: 20}}>₹{getTotalExpenseThisMonth()}</Text>
            </View>
            </View>
  
          </View>
        );
      
    }

  

    if(id === 'ier')
        {
            return (
              <View style={styles.container} pointerEvents="none">
               <Text style={{color: Colors.gray, fontWeight: '500', fontSize: 16}}><Text style={{color: (getEIratio() !== null)? (getEIratio()! < 51)?(getEIratio()! < 21)?"goldenrod": "green" : (getEIratio()! < 81) ? "orange" : "red" :Colors.gray, fontWeight: '500', fontSize: 16}}>E/I</Text> ratio</Text>
            <View style={{alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 12}}>
            <View style={{height: 80, width: 80, borderRadius: 22, borderColor:(getEIratio() !== null)? (getEIratio()! < 51)?(getEIratio()! < 21)?"goldenrod": "green" : (getEIratio()! < 81) ? "orange" : "red" :Colors.dark, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{color: (getEIratio() !== null)? (getEIratio()! < 51)?(getEIratio()! < 21)?"goldenrod": "green" : (getEIratio()! < 81) ? "orange" : "red" :Colors.dark, fontWeight: 'bold', fontSize: 24}}>{(getEIratio() !== null)? `${getEIratio()?.toFixed(0)!}%`:"NA"}</Text>
            <Text style={{color: (getEIratio() !== null)? (getEIratio()! < 51)?(getEIratio()! < 21)?"goldenrod": "green" : (getEIratio()! < 81) ? "orange" : "red" :Colors.gray, fontSize: 12}}>{(getEIratio() !== null)? (getEIratio()! < 51)?(getEIratio()! < 21)?"Excellent": "Good" : (getEIratio()! < 81) ? "Average" : "Poor" :""}</Text>
            </View>
            </View>
  
          </View>
            );
          
        }




};

export default Tile;