import { View, Text, StyleSheet, Vibration, TouchableOpacity, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView, ScrollView, TextInput } from 'react-native-gesture-handler'
import Colors from '@/constants/Colors'
import SelectDropdown from 'react-native-select-dropdown'
import {  Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import DatePicker from 'react-native-date-picker'
import { defaultStyles } from '@/constants/Styles'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useListsStore } from '@/store/listsStore'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import Toast from 'react-native-simple-toast';
import { useBalanceStore } from '@/store/balanceStore'
import { cancelScheduledNotification } from '@/app/utils/notifications'
import { useCategoryStore } from '@/store/categoryListStore'







  

const Page = () => {


  
  const [recurring , setRecurring] = useState(false);
  const [rdate, setRdate] = useState("");

  const [categoriesData, setCategoryData] = useState<any>([]);

  const { getAllExpenseCats} = useCategoryStore();

  

    const [category,  setCategory] = useState("");
    const [title, setTitle] = useState("");
    const [date , setDate] = useState(new Date());
    const [listItems, setListItems] = useState<any>([]);
    const [open, setOpen] = useState(false);    
    const [gray, setGray] = useState(true);
    const [amounts , setAmounts] = useState({total:0, spent:0})
    const [menuOpen, setMenuOpen] = useState(false);
    const [autoFocus, setAutoFocus] = useState(false);
    const [notifId, setNotifId] = useState("");

    const {id} = useLocalSearchParams<{id: string}>();
    
    const router = useRouter();

    const { editList, getList } = useListsStore();
    const { runTransactions } = useBalanceStore();

    const AnimHeight = useSharedValue(0);
    const AnimOpacity = useSharedValue(0);

    const [addedToTransactions, setAddedToTransactions] = useState(false);

    useFocusEffect(useCallback(()=>{
      setCategoryData(getAllExpenseCats());
  }, []))

    useFocusEffect(useCallback(()=>{
        const list = getList(id);
        setTitle(list.title);
        setCategory(list.category);
        setListItems(list.listItems);
        setAmounts({total: list.totalAmount, spent: list.spentAmount});
        const dmy = list.date.split(",")[0].split("/")
        const d = new Date()
        d.setDate(Number(dmy[0]));
        d.setMonth(Number(dmy[1])-1);
        d.setFullYear(Number(dmy[2]));
        setDate(new Date(d));
        setAutoFocus(false);
        setAddedToTransactions(list.addedToTransactions);
        setRecurring(list.isRecurring);
        setRdate(list.recurringDate);
        setNotifId(list.notifId);

       
    },[]))

   
    useFocusEffect(useCallback(()=>{

        const totalAmount = listItems.reduce((prev:any,curr:any)=>(prev+curr.amount),0);
        setAmounts((prev)=>({...prev, total: totalAmount}));
    },[listItems]))

    const onAddItem = ()=>{
      if(menuOpen) {HandleMenuOpen()}
        Vibration.vibrate(10);
        const id = Math.random().toString()+"&"+"ListItem"+"&" + "@"+ new Date().toISOString();
        if(listItems.length === 0)
        {
        setAutoFocus(true);
        setListItems((prev:any)=>([...prev, {id: id,data: "", isChecked: false,amount: 0, hasAmount: false, transId: ""}]));
        }
        else{
            const  allPrevFilled = listItems.filter((item:any)=>(item.data.trim() !== "")).length === listItems.length;
            if(allPrevFilled)
            {
                setAutoFocus(true);
                setListItems((prev:any)=>([...prev, {id: id,data: "", isChecked: false,amount: 0, hasAmount: false, transId: ""}]));
            }
            else{
                setAutoFocus(false);
                Toast.show("Please fill all the previous items", Toast.SHORT);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
        }
    }

    const addToTransactions = async()=>{
        const currDate =  new Date().toISOString();
        for(let i = 0; i < listItems.length; i++)
        {
            if(listItems[i].hasAmount &&  listItems[i].amount > 0){
                await runTransactions({
                    id: Math.random().toString() + "@"+ currDate,
                    amount: listItems[i].amount,
                    date: date.toDateString(),
                    title: `${title} - ${listItems[i].data}` || `${category} - ${listItems[i].data}`,
                    type: "expense",
                    category: category,
                });    
            }
        }
        
    }
    
    const onSave = async()=>{
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const completed = listItems.filter((item:any)=>item.isChecked === true).length === listItems.length;

    if(addedToTransactions)
    {
        Toast.show("List is already added to your transactions history!", Toast.SHORT);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
    }

    if(recurring === false)
    {
      if(id.startsWith("$r$"))
      {
        if(notifId !== "")
        {
          await cancelScheduledNotification(notifId);
          setNotifId("");
        }
      }
    }
      
      if(completed)
      {
        Alert.alert("Do you want to add all spends to your transactions history?", `These will be added to ${category} category on ${date.getDate().toString().padStart(2,"0")}/${(date.getMonth()+1).toString().padStart(2,"0")}/${date.getFullYear().toString().padStart(4,"0")}, ${date.toString().split(' ')[0]} date. Note: You won't be able to edit the list later and even after deleting the transactions will be present in your transactions history.`,
                [
                    { text: "No", onPress : ()=>{Vibration.vibrate(10); editList(id,{
                        id: id,
                        title: title,
                        date: `${date.getDate().toString().padStart(2,"0")}/${(date.getMonth()+1).toString().padStart(2,"0")}/${date.getFullYear().toString().padStart(4,"0")}, ${date.toString().split(' ')[0]}`,
                        category: (category === "Weekly")?"Weekly":(category === "Monthly")?"Monthly":(category === "Groceries")?"Groceries":(category === "Other")?"Other":"None",
                        listItems: listItems,
                        totalAmount: amounts.total,
                        spentAmount: amounts.spent,
                        isCompleted: completed,
                        addedToTransactions: false,
                        isRecurring: recurring,
                        recurringDate: rdate,
                        notifId: notifId,
                      });
                      router.back();},style: "cancel" },
                    {
                        text: "Yes",
                        onPress: ()=>{
                            addToTransactions();
                            Toast.show("All spends are added to your transactions history successfully!", Toast.SHORT);
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            setAddedToTransactions(true);
                            editList(id,{
                                id: id,
                                title: title,
                                date: `${date.getDate().toString().padStart(2,"0")}/${(date.getMonth()+1).toString().padStart(2,"0")}/${date.getFullYear().toString().padStart(4,"0")}, ${date.toString().split(' ')[0]}`,
                                category: (category === "Weekly")?"Weekly":(category === "Monthly")?"Monthly":(category === "Groceries")?"Groceries":(category === "Other")?"Other":"None",
                                listItems: listItems,
                                totalAmount: amounts.total,
                                spentAmount: amounts.spent,
                                isCompleted: completed,
                                addedToTransactions: true,
                                isRecurring: recurring,
                                recurringDate: rdate,
                                notifId: notifId,
                              });
                            router.back();
                            
                        }
                    }
                ] )
      
      

    }
    else{
        
      editList(id,{
        id: id,
        title: title,
        date: `${date.getDate().toString().padStart(2,"0")}/${(date.getMonth()+1).toString().padStart(2,"0")}/${date.getFullYear().toString().padStart(4,"0")}, ${date.toString().split(' ')[0]}`,
        category: (category === "Weekly")?"Weekly":(category === "Monthly")?"Monthly":(category === "Groceries")?"Groceries":(category === "Other")?"Other":"None",
        listItems: listItems,
        totalAmount: amounts.total,
        spentAmount: amounts.spent,
        isCompleted: completed,
        addedToTransactions:false,
        isRecurring: recurring,
        recurringDate: rdate,
        notifId: notifId,
      });
        router.back();
    }
        
    }

    const HandleDataChange = (id:string,text:string)=>{
      
        let amount = 0;
        const hasAmount = !isNaN(Number(text.trim().split("++")[1])) && (Number(text.trim().split("++")[1]) !==0)  
        if(hasAmount)
        {
          amount = Number(text.trim().split("++")[1]);
        }
        setListItems((prev:any)=>(prev.map((item:any)=>item.id === id?{...item,hasAmount: hasAmount, amount: amount, data: text}:item)));
        
        
    }

    const HandleCheckChange = (id:string,isChecked:boolean)=>{
      Vibration.vibrate(10);
      const item = listItems.find((item:any)=>item.id === id);
      if(isChecked)
      {
        if(item.hasAmount)
        {
          setAmounts((prev)=>({...prev, spent: prev.spent-item.amount}));
        }
      }
      else{

        if(item.hasAmount)
        {
          setAmounts((prev)=>({...prev, spent: prev.spent+item.amount}));
        }
      }
      const lst = listItems.map((item:any)=>item.id === id?{...item, isChecked: !isChecked}:item);

      setListItems(lst);
  }


    const customSpringStyles = useAnimatedStyle(() => {
      return {
       height: withSpring(AnimHeight.value, {
          damping: 20,
          stiffness: 90,
        }),
        opacity: withSpring(AnimOpacity.value, {
          damping: 20,
          stiffness: 90,
        }),
      };
    });

    const HandleMenuOpen = () => {
      Vibration.vibrate(10);
      if(menuOpen)
      {
        AnimHeight.value = 0;
        AnimOpacity.value = 0;
        setTimeout(()=>{setMenuOpen((prev)=>!prev);},400)
      }
      else{
        AnimHeight.value = (recurring)?140:110;
        AnimOpacity.value = 1;
        setMenuOpen((prev)=>!prev);
      }
        
        
    }

    const HandleKeyPress = (e:any)=>{
      if(e.nativeEvent.text.trim() != ""  )
      {
        if(menuOpen) {HandleMenuOpen()}
        const id = Math.random().toString()+"&"+"ListItem"+"&" + "@"+ new Date().toISOString();
        setAutoFocus(true);
        setListItems((prev:any)=>([...prev, {id: id,data: "", isChecked: false,amount: 0, hasAmount: false, transId: ""}]));
        
      }
    }

    const handleRecurring = ()=>{
      Vibration.vibrate(10); 
      setRecurring(false);
      Toast.show("Please save to stop recurring",Toast.SHORT);
    }


    const handleRecurringDate = ()=>{
      const type = rdate.split("@")[0];
      if(type === "W")
      {
        const dte = rdate.split("@")[1]
        return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][Number(dte)];
      }
      else if(type === "M"){
        const dte = new Date(rdate.split("@")[1]).getDate();

        return `${dte}${(Number(dte) === 1 || Number(dte) === 21 || Number(dte) === 31)?"st":(Number(dte) === 2 || Number(dte) === 22)?"nd":(Number(dte) === 3 || Number(dte) === 23)?"rd":"th"}`;
      }
      return "";
    }
   

  return (
    <GestureHandlerRootView style={[styles.container]}>
        <StatusBar style='dark'/>
        <View style={[styles.mainInputContainer, {gap: 10, marginBottom: 0}]}>
            <View style={[styles.inputContainer, {width: '100%'}]}> 
                {(addedToTransactions)?<Text style={[styles.input, {fontSize: 20,borderRadius: 12,padding: 10, fontWeight: 'bold', width: '90%'}]}>{title}</Text>:              <TextInput style={[styles.input, {fontSize: 20,borderRadius: 12,padding: 10, fontWeight: 'bold', width: '90%'}]} placeholder={"Shopping List"}  autoCapitalize='sentences'  autoCorrect={true} placeholderTextColor={Colors.gray}  keyboardType='default' onChangeText={setTitle} value={title}/>
            }               
              <TouchableOpacity style={{width: "10%"}} onPress={HandleMenuOpen}>
                <Ionicons name={'ellipsis-vertical'} size={24} color={(!menuOpen)? Colors.gray: Colors.dark}/>
              </TouchableOpacity>
            </View>
            { (menuOpen) && 
              (<Animated.View style={[customSpringStyles,{gap:10}]}>

                {(recurring) && <>
                  <View style={[styles.inputContainer, {width: '100%', justifyContent: 'flex-end'}]}>
                      <View style={{width: "50%", alignItems:"center", justifyContent:"center"}}>          
                    <Text style={[styles.input, {color:Colors.dark, fontWeight: 'bold', fontSize: 16,borderRadius: 10,padding: 8,width: '100%'}]} >{category}</Text>
                      </View>
                      
               </View>
               <View style={[styles.inputContainer, {width: '100%', justifyContent: 'flex-end'}]}>
                      <View style={{width: "50%", alignItems:"center", justifyContent:"center"}}>          
                    <Text style={[styles.input, {color:Colors.dark, fontWeight: 'bold', fontSize: 16,borderRadius: 10,padding: 8,width: '100%'}]} >{handleRecurringDate()}</Text>
                      </View>
                      
               </View>
               <View style={[styles.inputContainer, {width: '100%', justifyContent: 'flex-end'}]}>
                      <View style={{width: "50%", alignItems:"center", justifyContent:"center"}}>  
                        <TouchableOpacity style={[styles.input, {backgroundColor: "#f00000",borderRadius: 10, padding:8, width: "100%"}]} onPress={()=>{handleRecurring()}}>
                          <Text  style={[{color:"#fff", fontWeight: "bold", fontSize: 16, textAlign: "center"}]}>Stop Recurring</Text>
                          </TouchableOpacity>        
                      </View>
                      
               </View>
                </>}

               {(addedToTransactions && !recurring) && <><View style={[styles.inputContainer, {width: '100%', justifyContent: 'flex-end'}]}>
               <View style={{width: "50%", alignItems:"center", justifyContent:"center"}}>          
                    <Text style={[styles.input, {color:Colors.dark, fontWeight: 'bold', fontSize: 18,borderRadius: 10,padding: 10,width: '100%'}]} >{category}</Text>
                </View>
               
               </View>
               <View style={[styles.inputContainer, {width: '100%',justifyContent: "flex-end"}]}>     
               <View style={{width: "50%", alignItems:"center", justifyContent:"center"}}>          
                    <Text style={[styles.input, {color:Colors.dark, fontWeight: 'bold', fontSize: 18,borderRadius: 10,padding: 10,width: '100%'}]} >{`${date.getDate().toString().padStart(2,"0")}/${(date.getMonth()+1).toString().padStart(2,"0")}/${date.getFullYear().toString().padStart(4,"0")}, ${date.toString().split(' ')[0]}`}</Text>
                </View>
                </View>   
               </>
                }{
                  (!addedToTransactions && !recurring) &&  <><View style={[styles.inputContainer, {width: '100%', justifyContent: 'flex-end'}]}>
            <SelectDropdown
                data={categoriesData}
                
                onSelect={(selectedItem, index) => {
                    Vibration.vibrate(5);
                    setCategory(selectedItem.title);
                    }}
                
                renderButton={(selectedItem, isOpened) => {

                    return (
                      <View style={styles.dropdownButtonStyle}>
                        <Text style={[styles.dropdownButtonTxtStyle, ((selectedItem && selectedItem.title) || category)?{color: Colors.dark}:{color: Colors.gray}]}>
                          {(selectedItem && selectedItem.title) || category || 'Category'}
                        </Text>
                        <Ionicons name={isOpened ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
                      </View>
                    );
                    }}
                renderItem={(item, index, isSelected) => {
                    return (
                        <View style={{...styles.dropdownItemStyle, ...(isSelected && {backgroundColor: '#D2D9DF'})}}>
                            <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
                         </View>
                    );
                    }}
                showsVerticalScrollIndicator={false}
                 dropdownStyle={styles.dropdownMenuStyle}
                />         
            </View>

            
            <View style={[styles.inputContainer, {width: '100%',justifyContent: "flex-end"}]}>                
                <TouchableOpacity style={{width: "50%", alignItems:"center", justifyContent:"center"}} onPress={()=>{Vibration.vibrate(10);setOpen(true); setGray(false)}}>          
                    <Text style={[styles.input, {color: (!gray)?Colors.dark:Colors.gray,fontWeight: 'bold', fontSize: 18,borderRadius: 10,padding: 10,width: '100%'}]} >{`${date.getDate().toString().padStart(2,"0")}/${(date.getMonth()+1).toString().padStart(2,"0")}/${date.getFullYear().toString().padStart(4,"0")}, ${date.toString().split(' ')[0]}`}</Text>
                </TouchableOpacity>
                <DatePicker modal open={open} onConfirm={(date)=>{
                    setOpen(false);
                    if(date.valueOf() > new Date().valueOf())
                    {
                        setDate(new Date());
                    }
                    else{
                        setDate(date);
                    }
                    
                }}
                onCancel={()=>{setOpen(false)}} 
                theme="light"
                mode={"date"}    date={date} onDateChange={setDate}/>

              </View >
              </>
            } 
             
              </Animated.View>)
              }
              {
                (!menuOpen) && <View style={{flex: 1, marginBottom: 4}}/>
              }
        </View>



        <ScrollView style={{flex:1, width: "100%", marginBottom: 30}}>
            { listItems.map((item:any,idx:number)=>(
               
                (!addedToTransactions) ?  <View  key={idx} style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 4, gap:10}}>
                     <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center'}} onPress={()=>{HandleCheckChange(item.id, item.isChecked)}}>
                         {(!item.isChecked) && <Ionicons name={'square-outline'} size={24} color={Colors.gray}/>}
                         {(item.isChecked) && <Ionicons name={'checkbox-outline'} size={24} color={Colors.dark}/>}
                    </TouchableOpacity>
                    <TextInput style={{fontStyle: (item.isChecked)?"italic":"normal",textDecorationLine: (item.isChecked)?"line-through":"none",flex: 1,borderColor: (item.isChecked)?Colors.gray:Colors.dark, borderRadius: 10, padding: 8 ,fontSize: 18, borderWidth:StyleSheet.hairlineWidth}} autoFocus={autoFocus} returnKeyType="done" onSubmitEditing={HandleKeyPress} autoCorrect={true} autoCapitalize="sentences" keyboardType='default' placeholder="Item ++100" value={item.data} editable={(!item.isChecked)} onChangeText={(text)=>{HandleDataChange(item.id, text)}}/>
                    <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center'}} onPress={()=>{Vibration.vibrate(10);setListItems((prev:any)=>(prev.filter((itm:any,idx:number)=>itm.id !== item.id)))}}>
                        <Ionicons name={'trash-outline'} size={20} color={"#f00000"}/>
                    </TouchableOpacity>
                </View>: <View  key={idx} style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 4, gap:10}}>
                        <View style={{justifyContent: 'center', alignItems: 'center'}}>
                            <Ionicons name={'checkbox-outline'} size={24} color={Colors.dark}/>
                        </View>
                        <Text style={{fontStyle: "italic", textDecorationLine: "line-through", flex: 1, borderColor: Colors.gray, borderRadius: 10, padding: 8, fontSize:18, borderWidth:StyleSheet.hairlineWidth, color: Colors.gray}}>{item.data}</Text>
                     </View>
              
            ))}
        </ScrollView>

        {(amounts.total > 0) &&    <View style={{flexDirection: 'row', width: "100%",alignItems: 'center', justifyContent:"flex-end", marginTop: 10, marginBottom: 20, padding :2}}>
            <View style={{ width: "50%",padding: 10, alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: "#000", borderRadius: 12}}>
            <View style={{flexDirection: "row", width:"100%", alignItems:"center", justifyContent:"space-evenly"}}><Text style={{fontSize: 16}}>Spent</Text><Text style={{fontSize: 20, fontWeight: '500'}}>{amounts.spent}</Text></View>
            <View style={{width: "100%", marginVertical: 4,borderColor:Colors.gray, borderBottomWidth: StyleSheet.hairlineWidth}}/>
            <View style={{flexDirection: "row", width:"100%",alignItems:"center", justifyContent:"space-evenly"}}><Text style={{fontSize: 16}}>Total</Text><Text style={{fontSize: 20, fontWeight: '500'}}>{amounts.total}</Text></View>
            </View>
        </View> }

     
     {(!addedToTransactions) && <View style={{flexDirection: 'row', alignItems: 'center',justifyContent:'center' ,gap:14}}>
        <TouchableOpacity style={[defaultStyles.pillButton,(listItems.length <= 0) ? styles.disabled:styles.enabled, {width: "50%"}]} onPress={onSave}>
        <Text style={defaultStyles.buttonText}>Save</Text>
      </TouchableOpacity>
        <TouchableOpacity style={[defaultStyles.pillButton,styles.enabled, {width:"50%"}]} onPress={onAddItem}>
        <Text style={defaultStyles.buttonText}>+ Add Item</Text>
      </TouchableOpacity>
        </View>}
        
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: 20,
        paddingVertical: 10,
      },
    mainInputContainer: {
        marginTop:10,
        marginBottom:30,
        flexDirection: 'column',
        gap: 24,
        justifyContent: 'center',
        alignContent: 'center',
      },
      inputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      },
      
      input : {
        backgroundColor: Colors.lightGray,
        padding: 20,
        borderRadius: 16,
        fontSize: 20,
        marginRight: 10,
        
      },
      
      enabled: {
        backgroundColor: Colors.primary,
      },
      
      disabled : {
        backgroundColor: Colors.primaryMuted,
      },

      dropdownButtonStyle: {
        marginRight: 6,
        padding:10,
        backgroundColor: Colors.lightGray,
        borderRadius: 10,
        fontSize: 18,
        width: '50%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
      },
      dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.dark,
      },
      dropdownButtonArrowStyle: {
        fontSize: 24,
        color: Colors.gray,
      },
      dropdownButtonIconStyle: {
        fontSize: 28,
      },
      dropdownMenuStyle: {
        backgroundColor: Colors.lightGray,
        borderRadius: 12,
        marginTop: -40,
      },
      dropdownItemStyle: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
      },
      dropdownItemTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.gray,
      },
      
})

export default Page