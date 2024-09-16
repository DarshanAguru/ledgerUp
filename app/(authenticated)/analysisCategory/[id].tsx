import { View, Text,  StyleSheet,  TouchableOpacity, Vibration } from 'react-native'
import React, {  useState } from 'react'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import {  ScrollView } from 'react-native-gesture-handler';
import {  useBalanceStore } from '@/store/balanceStore';
import Animated from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { PieChart} from 'react-native-gifted-charts';
import { useCategoryStore } from '@/store/categoryListStore';



Animated.addWhitelistedNativeProps( {text: true } )



const Page = () => {
  
  const [dataTrans, setDataTrans] = useState<any>(null);
  
  const {filterTransactions} = useBalanceStore();

  const {id , date} = useLocalSearchParams<{id: string, date:string}>();

  const {getCatCol} = useCategoryStore();


  
  const [activeIndex , SetActiveIndex] = useState(0);

  


  const DataTrans  = () => {
    const filteredTrans = filterTransactions({duration: (Number(date) === 1) ? 'week' : (Number(date) === 2) ? 'month' : (Number(date) === 3) ? 'threeMonths':'day'});
    return (filteredTrans!==null && filteredTrans.length> 0)?filteredTrans:null;
  }


  const getDataForCategory = ()=>{
    const filteredTrans_s = dataTrans.filter((trans:any)=>(trans.category === id));
    return filteredTrans_s!;
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
      lst.push({value: perc, focused: (k === id),color: getCatCol(k), text: `${k}@${v}`,strokeWidth:1,strokeColor: "#fff" });
    }
    lst.sort((a:any,b:any)=>(a.value < b.value) ? 1 : -1);
    return lst;
  }


  useFocusEffect(
    React.useCallback(()=>{
      SetActiveIndex(0);
      setDataTrans(DataTrans());

  },[]));
 

  const data = (dataTrans!==null)?getData():null;
  const dataOfCategory = (dataTrans!==null)?getDataForCategory():null;

  return (
    <>
    <StatusBar style='dark'/>
       <View style={{marginTop: 10,backgroundColor: Colors.background}}>
       
          <View style={[defaultStyles.block,{marginBottom:0,height: 220}]}>
            {
              (data === null || data.length === 0) && (
                <>
                <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{fontSize: 32, fontWeight: 'bold', color: Colors.dark}}> 
                    No Transactions Yet!
                  </Text>

                </View>
                </>
              )
            }

            {
              (data !== null && data.length > 0) && (<View style={{elevation:4}} >
              <Text style={{fontWeight: "bold", fontSize: 18, marginBottom: 20}}>{(activeIndex === 0)?`Spends today on ${id}`:(activeIndex === 1)?`Spends this Week on ${id}`:(activeIndex === 2)?`Spends this Month on ${id}`:`Spends this Quarter on ${id}`}</Text>
              <View style={{width:"100%",alignItems:"center",justifyContent:"center"}}>
              <PieChart
              data={data!}
              radius={80}
              backgroundColor="#fff"
              donut
              showGradient
              sectionAutoFocus={true}
              focusOnPress={false}
              gradientCenterColor='#ffffff'
              innerRadius={50}
              innerCircleBorderWidth={1}
              innerCircleBorderColor={getCatCol(id)}
              centerLabelComponent={() => {
                const perc = data!.find((itm:any)=>itm.text.split("@")[0] === id)?.value;
                return (
                  <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text
                      style={{fontSize: 22, color: 'black', fontWeight: 'bold'}}>
                      {`${perc}%`}
                    </Text>
                    <Text style={{fontSize: 14, color: 'black'}}>{`${id}`}</Text>
                  </View>
                );
              }}
        
              />

              </View>
              
              </View>)
            }

          </View>
         <Text style={[defaultStyles.sectionHeader, {fontSize: 22, marginBottom: 0}]}>
              Transactions for {id}
            </Text>
          <ScrollView  showsVerticalScrollIndicator={true}  style={[defaultStyles.block, {height: 440,marginTop: 10}]}>
         
            <View style={[styles.transactions, {marginBottom: 10}]}>
        {dataOfCategory===null && <Text style={{padding: 8, color: Colors.gray}}>No Transactions yet</Text>}
        {
          dataOfCategory !== null && (dataOfCategory.map((trans:any)=>{
            const date= new Date(trans.date);
            return (
            <View key = {trans.id} style={{flexDirection: 'row', marginBottom: 10,alignItems: 'center', gap:14, backgroundColor :"#fff", borderRadius: 8, paddingHorizontal: 4}}>
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