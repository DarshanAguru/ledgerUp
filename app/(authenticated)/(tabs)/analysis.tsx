import { View, Text,  StyleSheet,  TouchableOpacity, Vibration } from 'react-native'
import React, { useRef, useState } from 'react'
import { useFocusEffect, useRouter } from 'expo-router';
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import {  ScrollView } from 'react-native-gesture-handler';
import {  useBalanceStore } from '@/store/balanceStore';
import Animated from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { PieChart} from 'react-native-gifted-charts';
import { useCategoryStore } from '@/store/categoryListStore';



Animated.addWhitelistedNativeProps( {text: true } )


const filtersDates = ['24 Hours', '7 Days', '30 Days', '90 Days'];
const filtersNames = ['Today', 'This Week', 'This Month', 'This Quarter'];

const Page = () => {
  
  const [dataTrans, setDataTrans] = useState<any>(null);
  

  const {getCatCol} = useCategoryStore();

  const router = useRouter();


  const {filterTransactions} = useBalanceStore();

  const scrollViewRef = useRef<any>(null)
  
  const [activeIndex , SetActiveIndex] = useState(0);
  const [ie, setIe] = useState<{income:number|undefined, expense: number|undefined}>({income:0, expense: 0})

  const [pressedCategory, setPressedCategory] = useState<string>("");


  const DataTrans  = (idx:any) => {
    const filteredTrans = filterTransactions({duration: (idx === 1) ? 'week' : (idx === 2) ? 'month' : (idx === 3) ? 'threeMonths':'day'});
    let inc = filteredTrans?.filter((trans)=>(trans.type === "income")).reduce((acc,itm)=>(acc+itm.amount),0)
    let exp = filteredTrans?.filter((trans)=>(trans.type === "expense")).reduce((acc,itm)=>(acc+itm.amount),0)
    setIe({income:inc, expense: exp})
    return (filteredTrans!==null && filteredTrans.length> 0)?filteredTrans:null;
  }

  const getData = () =>{
    let lst:any = [];
    let totalAmount = 0;
    let sbec:any = {};
    dataTrans.forEach((itm:any)=>{
      if(itm.type === "expense")
      {
      totalAmount += itm.amount;
      if(sbec[itm.category] === undefined)
      {
        sbec[itm.category] = itm.amount;
      }
      else{
        sbec[itm.category] += itm.amount;
      }
    }
    })
    for(let [k,v] of Object.entries(sbec))
    {
     const perc = Math.round((Number(v)/totalAmount)*10000)/100;
      lst.push({value: perc, color: getCatCol(k), text: `${k}@${v}`,strokeWidth:1,strokeColor: "#fff" });
    }
    lst.sort((a:any,b:any)=>(a.value < b.value) ? 1 : -1);
    return lst.map((itm:any,id:any)=>({...itm,    onPress: ()=>{Vibration.vibrate(5);scrollViewRef.current.scrollTo({ x: 0, y: 30 * id, animated: true });(pressedCategory ===itm.text.split("@")[0])?setPressedCategory(""):setPressedCategory(itm.text.split("@")[0])}  }));
  }


  useFocusEffect(
    React.useCallback(()=>{
      SetActiveIndex(0);
      setDataTrans(DataTrans(0));
      setPressedCategory("");
  },[]));
 

  const data = (dataTrans!==null)?getData():null;

  return (
    <>
    <StatusBar style='dark'/>
       <View style={{marginTop: 10,backgroundColor: Colors.background}}>
       
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={{
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingBottom: 10,
            backgroundColor: Colors.background,
            borderBottomColor: Colors.lightGray,
            borderBottomWidth: StyleSheet.hairlineWidth,
          }}>
              
              {
                filtersDates.map((item,index)=>(
                    <TouchableOpacity key={index} style={activeIndex === index ? styles.filterButtonActive : styles.filterButton} onPress={()=>{Vibration.vibrate(10);setDataTrans(DataTrans(index)); SetActiveIndex(index)}}>
                        <Text style={activeIndex === index  ? styles.filterTextActive : styles.filterText }>{item}</Text>
                    </TouchableOpacity>
                ))
              }
            
          </ScrollView>
        

          <View style={[defaultStyles.block,{marginBottom:0,height: 240}]}>
            {
              (data === null || data.length === 0) && (
                <>
                <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{fontSize: 32, fontWeight: 'bold', color: Colors.dark}}> 
                    No Transactions {filtersNames[activeIndex]}
                  </Text>

                </View>
                </>
              )
            }

            {
              (data !== null && data.length > 0) && (<View style={{elevation:4}} >
              <Text style={{fontWeight: "bold", fontSize: 20}}>{(activeIndex === 0)?`Today`:(activeIndex === 1)?"This Week":(activeIndex === 2)?"This Month":"This Quarter"}</Text>
              {(ie.income !== undefined && ie.expense !== undefined) &&
              <View style={{flexDirection: "row", gap:14,alignItems :"center", paddingBottom: 8, paddingTop:2}}>
                <View style={{flexDirection: "row", gap: 4, alignItems: "center"}}>
                <Text style={{color: Colors.gray, fontSize: 12}}>Income:</Text>
                <Text style={{color: "green", fontSize: 14, fontWeight: "bold"}}>₹{ie.income}</Text>
                </View>
                <View style={{flexDirection: "row", gap: 4, alignItems: "center"}}>
                <Text style={{color: Colors.gray, fontSize: 12}}>Expense:</Text>
                <Text style={{color: "red", fontSize: 14, fontWeight: "bold"}}>₹{ie.expense}</Text>
                </View>
                </View>
              }
              <View style={{width:"100%",alignItems:"center",justifyContent:"center"}}>
              <PieChart
              data={data!}
              radius={80}
              backgroundColor="#fff"
              donut
              showGradient
              gradientCenterColor='#ffffff'
              innerRadius={50}
              innerCircleColor={"#ffffff"}
              centerLabelComponent={() => {
                let perc =  "";
                if(pressedCategory !== "")
                {
                  perc = data!.find((itm:any)=>itm.text.split("@")[0] === pressedCategory)?.value;
                }
                return (
                  <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text
                      style={{fontSize: 22, color: 'black', fontWeight: 'bold'}}>
                      {(pressedCategory !== "")? `${perc}%`:""}
                    </Text>
                    <Text style={{fontSize: 14, color: 'black'}}>{(pressedCategory !== "")? `${pressedCategory}`:''}</Text>
                  </View>
                );
              }}
        
              />

              </View>
              
              </View>)
            }

          </View>
         <Text style={[defaultStyles.sectionHeader, {fontSize: 24, marginBottom: 0}]}>
              Spends by Categories
            </Text>
          <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={true}  style={[defaultStyles.block, {height: 350,marginTop: 10}]}>
         
            <View style={[styles.transactions, {marginBottom: 10}]}>
        {(data===null || data.length <=0) && <Text style={{padding: 8, color: Colors.gray}}>No Transactions {filtersNames[activeIndex]}</Text>}
        {
        (data !== null && data.length > 0) && (data.map((trans:any,idx:any)=>{
            return (
              //@ts-ignore
            <TouchableOpacity onPress={()=>{Vibration.vibrate(10); (pressedCategory === trans.text.split("@")[0])?setPressedCategory(""):setPressedCategory(trans.text.split("@")[0]); router.push({pathname: '/analysisCategory/[id]', params: {id: trans.text.split("@")[0],date: activeIndex.toString()}})}} key ={idx} style={{backgroundColor : ((pressedCategory === trans.text.split("@")[0]) ? `${getCatCol(trans.text.split("@")[0])}20` : "#fff"), flexDirection: 'row',marginBottom: 20, paddingHorizontal: 4,borderRadius: 8,alignItems: 'center'}}>
                <View style={{flex:1}}>
                  <Text style={{width:"100%", textAlign: "left",fontSize: 20, fontWeight: "bold", color: getCatCol(trans.text.split("@")[0])}}>{trans.text.split("@")[0]}</Text>
                </View>
                <View style={{alignItems: "center", justifyContent: "center"}}>
                  <Text style={{fontSize: 18, fontWeight:"bold"}}>{trans.value}%</Text>
                  <Text style={{fontSize: 10, color:Colors.gray}}>{`(₹${trans.text.split("@")[1]})`}</Text>
                </View>
            </TouchableOpacity>)
              }))
        }
        
      </View>
            
          </ScrollView>
          
       </View>
    </>
  )
}

const styles = StyleSheet.create({
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.gray,
  },

  filterText : {
    fontSize: 14,
    color: Colors.gray,
  },
  transactions: {
    backgroundColor: '#fff',
    borderRadius: 10,
   
  },

  filterTextActive: {
    fontSize: 14,
    color : '#000',
  },
  circle : {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  filterButton : {
    padding : 10,
    paddingHorizontal: 14,
    alignItems : 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },

  filterButtonActive: {
    padding: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
  }

});

export default Page