import { View, Text, StyleSheet, Vibration, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView, ScrollView, TextInput } from 'react-native-gesture-handler'
import Colors from '@/constants/Colors'
import SelectDropdown from 'react-native-select-dropdown'
import {  Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import DatePicker from 'react-native-date-picker'
import { defaultStyles } from '@/constants/Styles'
import { useFocusEffect, useRouter } from 'expo-router'
import { useListsStore } from '@/store/listsStore'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import Toast from 'react-native-simple-toast';
import { scheduleListNotification } from '@/app/utils/notifications'
import { useCategoryStore } from '@/store/categoryListStore'




const categoriesDays: any = [
  {title: "Sunday", data: 0},
  {title: "Monday", data: 1},
  {title: "Tuesday", data: 2},
  {title: "Wednesday", data: 3},
  {title: "Thursday", data: 4},
  {title: "Friday", data: 5},
  {title: "Saturday", data: 6},
]

  

const Page = () => {


  
  const [category,  setCategory] = useState("Other");
  const [recurring , setRecurring] = useState(false);
  const [title, setTitle] = useState("");
  const [date , setDate] = useState(new Date());
  const [listItems, setListItems] = useState<any>([]);
  const [open, setOpen] = useState(false);    
  const [gray, setGray] = useState(true);
  const [amounts , setAmounts] = useState({total:0, spent:0})
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [day, setDay] = useState(-1);
  const [mdate, setMdate] = useState(new Date().toISOString());
  const [categoriesData, setCategoryData] = useState<any>([]);

  const { getAllExpenseCats} = useCategoryStore();

  useFocusEffect(useCallback(()=>{
    setCategoryData(getAllExpenseCats());
}, []))
    const router = useRouter();

    const { setList } = useListsStore();

    const AnimHeight = useSharedValue(0);
    const AnimOpacity = useSharedValue(0);

    
    useFocusEffect(useCallback(()=>{

      const totalAmount = listItems.reduce((prev:any,curr:any)=>(prev+curr.amount),0);
      setAmounts((prev)=>({...prev, total: totalAmount}));
  },[listItems]))

    const onAddItem = ()=>{
      Vibration.vibrate(10);
      if(menuOpen) {HandleMenuOpen()}
      const id = Math.random().toString()+"&"+"ListItem"+"&" + "@"+ new Date().toISOString();
      if(listItems.length === 0)
      {
      
      setListItems((prev:any)=>([...prev, {id: id,data: "", isChecked: false,amount: 0, hasAmount: false, transId: ""}]));
      }
      else{
          const  allPrevFilled = listItems.filter((item:any)=>(item.data.trim() !== "")).length === listItems.length;
          if(allPrevFilled)
          {
             
              setListItems((prev:any)=>([...prev, {id: id,data: "", isChecked: false,amount: 0, hasAmount: false, transId: ""}]));
          }
          else{
              
              Toast.show("Please fill all the previous items", Toast.SHORT);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
      }    }
    
    const onSave = async()=>{
      if(listItems.length === 0)
      {
          Toast.show("Please add at least one item to your list", Toast.SHORT);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
      }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const currDate=  new Date().toISOString();
    const completed = false;
    const titl = (category === "Weekly")? "Weekly Shopping List":(category === "Monthly")?"Monthly Shopping List":"Shopping List";
    const id = (recurring)?"$r$"+Math.random().toString()+"&"+"List"+"&" + "@"+ currDate:Math.random().toString()+"&"+"List"+"&" + "@"+ currDate;
    let notifid = "";
    
    if(recurring && (category === "Weekly" || category === "Monthly"))
    {
      
       notifid = await scheduleListNotification({
        title: `Remainder ${category} Shopping List`,
        body: `Your ${category} shopping list is ready...`,
        type: (category === "Weekly")?`W`:((category === "Monthly")?`M`:"None"),
        param: (category === "Weekly")?day.toString():((category === "Monthly")?mdate:"None"),
      });   
    }
    
    const mmdate = new Date(new Date(mdate).valueOf() + 30*24*60*60*1000).toISOString();

    setList({
        id: id,
        title: title || titl,
        date: `${date.getDate().toString().padStart(2,"0")}/${(date.getMonth()+1).toString().padStart(2,"0")}/${date.getFullYear().toString().padStart(4,"0")}, ${date.toString().split(' ')[0]}`,
        category: (category === "Weekly")?"Weekly":(category === "Monthly")?"Monthly":(category!== "Other")?category:"Other",
        listItems: listItems,
        totalAmount: amounts.total,
        spentAmount: amounts.spent,
        isCompleted: completed,
        addedToTransactions: false,
        isRecurring: recurring,
        recurringDate: (recurring)?(category === "Weekly")?`W@${day}`:(category === "Monthly")?`M@${mmdate}`:"None":"None",
        notifId:notifid,
      })
        router.back();
    }

    const HandleDataChange = (id:string,text:string)=>{
      
        let amount = 0;
        const allLexes = text.trim().split(" ");
        let hasAmount = false;
        for(let i = 0; i < allLexes.length; i++)
        {
          const lex = allLexes[i];
          if(lex.startsWith("++"))
          {
            const val = lex.split("++")[1];
            if(val.split(" ").length > 1)
            {
              amount += Number(val.split(" ")[0]);
              hasAmount = true;
            }
            else{
              amount += Number(val);
              hasAmount = true;
            }
          }
        }
        
        setAmounts((prev)=>({...prev, total: prev.total+amount}));
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
        AnimHeight.value = 150;
        AnimOpacity.value = 1;
        setMenuOpen((prev)=>!prev);
      }
        
        
    }

    const HandleKeyPress = (e:any)=>{
      if(e.nativeEvent.text.trim() != ""  )
      {
        if(menuOpen) {HandleMenuOpen()}
        const id = Math.random().toString()+"&"+"ListItem"+"&" + "@"+ new Date().toISOString();
        
        setListItems((prev:any)=>([...prev, {id: id,data: "", isChecked: false,amount: 0, hasAmount: false, transId: ""}]));
        
      }
    }

   

  return (
    <GestureHandlerRootView style={[styles.container]}>
        <StatusBar style='dark'/>
        <View style={[styles.mainInputContainer, {gap: 10, marginBottom: 0}]}>
            <View style={[styles.inputContainer, {width: '100%'}]}>                
              <TextInput style={[styles.input, {fontSize: 20,borderRadius: 12,padding: 10, fontWeight: 'bold', width: '90%'}]} placeholder={(category == "Other")?"Shopping List":`${category} - List`}  autoCapitalize='sentences' autoCorrect={true} placeholderTextColor={Colors.gray}  keyboardType='default' onChangeText={setTitle} value={title}/>
              <TouchableOpacity style={{width: "10%"}} onPress={HandleMenuOpen}>
                <Ionicons name={'ellipsis-vertical'} size={24} color={(!menuOpen)? Colors.gray: Colors.dark}/>
              </TouchableOpacity>
            </View>
            { (menuOpen) && 
              (<Animated.View style={[customSpringStyles,{gap:10}]}>
                <View style={{width:"100%",flexDirection:"row", gap:10}}>
                  <View style={{width: "50%",flexDirection: "column", alignItems:"center", justifyContent:"center"}}>
                      <View style={[styles.inputContainer, {width: '100%', alignItems:"center", justifyContent: 'flex-start'}]}>
                      {(category === "Weekly" && recurring) && <SelectDropdown
                data={categoriesDays}
                onSelect={(selectedItem, index) => {
                    Vibration.vibrate(5);
                    setDay(selectedItem.data);
                    }}
                renderButton={(selectedItem, isOpened) => {

                    return (
                      <View style={styles.dropdownButtonStyle}>
                        <Text style={[styles.dropdownButtonTxtStyle, ((selectedItem && selectedItem.title) || (day!==-1))?{color: Colors.dark}:{color: Colors.gray}]}>
                          {(selectedItem && selectedItem.title) || (day!== -1 && categoriesDays.find((itm:any)=>itm.data === day)?.title) || 'Day'}
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
                />    }
                    

                      </View>
                      
                  

                  </View>
                      <View style={{width:"50%",flexDirection: "column", gap: 4}}>
                        <View style={[styles.inputContainer, {width: '100%', justifyContent: 'flex-end'}]}>

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

                        <View style={[styles.inputContainer, {width: '100%', justifyContent: 'flex-end'}]}>
                          
                        <TouchableOpacity style={{width: "100%", alignItems:"center", justifyContent:"center"}} onPress={()=>{Vibration.vibrate(10);setOpen(true); setGray(false)}}>          
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

                          </View>



                          {
                (category === "Monthly" || category === "Weekly") && (<View style={[styles.inputContainer, {width: '100%',justifyContent: "flex-end"}]}>
                  {
                    <TouchableOpacity style={{width: "100%",backgroundColor: Colors.lightGray, padding:5,borderRadius: 8,marginRight: 6,flexDirection: 'row',alignItems: 'center',justifyContent: 'center', gap:4}} onPress={()=>{Vibration.vibrate(10);setMdate(date.toISOString());setRecurring((prev:boolean)=>(!prev))}}>
                      {(recurring) && <Ionicons name={'checkbox-outline'} size={24} color={Colors.dark}/>}
                      {(!recurring) && <Ionicons name={'square-outline'} size={24} color={Colors.dark}/>}
                      <Text style={{fontSize: 16, fontWeight: '500', color: Colors.dark}}>Recurring List?</Text>
                    </TouchableOpacity>
                  }
                </View>)
              }
                          

            
                        </View>      
                </View>
          
           
              
              </Animated.View>)
              }
              {
                (!menuOpen) && <View style={{flex: 1, marginBottom: 4}}/>
              }
        </View>



        <ScrollView style={{flex:1, width: "100%", marginBottom: 30}}>
            { listItems.map((item:any,idx:number)=>(
               
                <View  key={idx} style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 4, gap:10}}>
                     <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center'}} onPress={()=>{HandleCheckChange(item.id, item.isChecked)}}>
                         {(!item.isChecked) && <Ionicons name={'square-outline'} size={24} color={Colors.gray}/>}
                         {(item.isChecked) && <Ionicons name={'checkbox-outline'} size={24} color={Colors.dark}/>}
                    </TouchableOpacity>
                    <TextInput style={{ fontStyle: (item.isChecked)?"italic":"normal", textDecorationLine: (item.isChecked)?"line-through":"none",flex: 1,borderColor: (item.isChecked)?Colors.gray:Colors.dark, borderRadius: 10, padding: 8 ,fontSize: 18, borderWidth:StyleSheet.hairlineWidth}} autoFocus={true} returnKeyType="done" onSubmitEditing={HandleKeyPress} autoCorrect={true} autoCapitalize="sentences" keyboardType='default' placeholder="Item ++100" value={item.data} editable={(!item.isChecked)} onChangeText={(text)=>{HandleDataChange(item.id, text)}}/>
                    <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center'}} onPress={()=>{Vibration.vibrate(10);setListItems((prev:any)=>(prev.filter((itm:any,idx:number)=>itm.id !== item.id)))}}>
                        <Ionicons name={'trash-outline'} size={20} color={"#f00000"}/>
                    </TouchableOpacity>
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


        <View style={{flexDirection: 'row', alignItems: 'center',justifyContent:'center' ,gap:14}}>
        <TouchableOpacity style={[defaultStyles.pillButton,(listItems.length <= 0) ? styles.disabled:styles.enabled, {width: "50%"}]} onPress={onSave}>
        <Text style={defaultStyles.buttonText}>Save</Text>
      </TouchableOpacity>
        <TouchableOpacity style={[defaultStyles.pillButton,styles.enabled, {width:"50%"}]} onPress={onAddItem}>
        <Text style={defaultStyles.buttonText}>+ Add Item</Text>
      </TouchableOpacity>
        </View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 10,
        paddingTop: 100,
        paddingHorizontal: 20,
      },
    mainInputContainer: {
        marginTop:30,
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
        width: '100%',
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