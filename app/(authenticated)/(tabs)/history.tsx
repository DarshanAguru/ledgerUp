import { View, Text,  StyleSheet,  TouchableOpacity, Vibration } from 'react-native'
import React, { useRef, useState } from 'react'
import { useFocusEffect, useRouter } from 'expo-router';
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import {  ScrollView } from 'react-native-gesture-handler';
import {  useBalanceStore } from '@/store/balanceStore';
import Animated from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BarChart} from 'react-native-gifted-charts';
import { useCategoryStore } from '@/store/categoryListStore';



Animated.addWhitelistedNativeProps( {text: true } )


const filtersDates = ['24 Hours', '7 Days', '30 Days', '90 Days'];
const filtersNames = ["Today", "This Week", "This Month", "This Quarter"];

const Page = () => {
  
  const [dataTrans, setDataTrans] = useState<any>(null);
  
  const {getCatCol} = useCategoryStore();

  const router = useRouter();

  const {filterTransactions} = useBalanceStore();

  const scrollViewRef = useRef<any>(null)
  
  const [itemPressedId, setItemPressedId] = useState("");
  
  const [activeIndex , SetActiveIndex] = useState(0);

  const [ie, setIe] = useState<{income:number|undefined, expense: number|undefined}>({income:0, expense: 0})




  const DataTrans  = (idx:any) => {
    const filteredTrans = filterTransactions({duration: (idx === 1) ? 'week' : (idx === 2) ? 'month' : (idx === 3) ? 'threeMonths':'day'});
    let inc = filteredTrans?.filter((trans)=>(trans.type === "income")).reduce((acc,itm)=>(acc+itm.amount),0)
    let exp = filteredTrans?.filter((trans)=>(trans.type === "expense")).reduce((acc,itm)=>(acc+itm.amount),0)
    setIe({income:inc, expense: exp})
    return (filteredTrans!==null && filteredTrans.length> 0)?filteredTrans:null;
  }

  const getData = () =>{
    let lst:any = [];
 
    dataTrans.forEach((itm:any,idx:any)=>{
      lst.push({value: itm.amount, frontColor: getCatCol(itm.category),onPress: ()=>{Vibration.vibrate(10);scrollViewRef.current.scrollTo({ x: 0, y: 30 * idx, animated: true }); if(itemPressedId === itm.id){setItemPressedId("")}else{setItemPressedId(itm.id)}}, topLabelComponent: ()=>(<Text style={{fontSize:10, width:"100%", color:(itm.type === "income")?"green":"red",textAlign:"center"}}>{itm.amount}</Text>), topLabelContainerStyle:{alignItems:"center", width:"100%"}});
     
    })
    return lst.reverse();
  }


  useFocusEffect(
    React.useCallback(()=>{
      SetActiveIndex(0);
      setDataTrans(DataTrans(0));
  },[]));
 

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
                    <TouchableOpacity key={index} style={activeIndex === index ? styles.filterButtonActive : styles.filterButton} onPress={()=>{Vibration.vibrate(10);setDataTrans(DataTrans(index));SetActiveIndex(index)}}>
                        <Text style={activeIndex === index  ? styles.filterTextActive : styles.filterText }>{item}</Text>
                    </TouchableOpacity>
                ))
              }
            
          </ScrollView>
        

          <View style={[defaultStyles.block,{height: 240}]}>
            {
              (dataTrans === null || dataTrans.length === 0) && (
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
              (dataTrans !== null && dataTrans.length > 0) && (<View style={{elevation:4}}>
              <Text style={{fontWeight: "bold", fontSize: 20}}>{(activeIndex === 0)?`Today`:(activeIndex === 1)?"This Week":(activeIndex === 2)?"This Month":"This Quarter"}</Text>
              {(ie.income !== undefined && ie.expense !== undefined) &&
              <View style={{flexDirection: "row", gap:14,alignItems :"center", paddingBottom: 5, paddingTop:1}}>
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
              <BarChart
              data={getData()!}
              height={150}
              width={340}
              spacing={8}
              barWidth={34}
              barBorderRadius={4}
              minHeight={2}
              noOfSections={5}
              xAxisThickness={0}
              yAxisThickness={0}
              xAxisLabelTextStyle={{color: Colors.gray}}
              isAnimated
              yAxisExtraHeight={15}
              yAxisLabelWidth={0}
              animationDuration={400}
              scrollToEnd
              scrollAnimation={true}
              topLabelTextStyle={{color: Colors.gray, fontSize: 10, textAlign: "center", width: "100%"}}
              
              />
              </View>)
            }

          </View>
         <Text style={[defaultStyles.sectionHeader, {fontSize: 24, marginBottom: 0}]}>
              Transactions History
            </Text>
          <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={true} style={[defaultStyles.block, {height: 350,marginTop: 10, marginBottom: 10}]}>
         
            <View style={[styles.transactions, {marginBottom: 20}]}>
        {(dataTrans===null ||  dataTrans.length <=0) && <Text style={{padding: 8, color: Colors.gray}}>No Transactions {filtersNames[activeIndex]}</Text>} 
        {
          (dataTrans !== null && dataTrans.length > 0) && (dataTrans.map((trans:any)=>{
            const date= new Date(trans.date);
            return (
              //@ts-ignore
            <TouchableOpacity key = {trans.id} onPress={()=>{Vibration.vibrate(8); router.push({pathname: '/trans/[id]', params:{id: trans.id}});}} style={{flexDirection: 'row', marginBottom: 4,alignItems: 'center', gap:14, backgroundColor : (itemPressedId === trans.id)?`${getCatCol(trans.category)}20`:"#fff", borderRadius: 8, paddingHorizontal: 4}}>
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
    borderRadius: 16,
    gap: 12
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