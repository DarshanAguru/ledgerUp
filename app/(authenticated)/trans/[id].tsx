import { View, Text, StyleSheet, Vibration, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler'
import Colors from '@/constants/Colors'
import SelectDropdown from 'react-native-select-dropdown'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import DatePicker from 'react-native-date-picker'
import { defaultStyles } from '@/constants/Styles'
import Toast from 'react-native-simple-toast';
import { useBalanceStore } from '@/store/balanceStore'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCategoryStore } from '@/store/categoryListStore'




const Page = () => {

    const [amount , setAmount] = useState("");
    const [category,  setCategory] = useState("");
    const [title, setTitle] = useState("");
    const [date , setDate] = useState(new Date());
    const [open, setOpen] = useState(false);    
    const [gray, setGray] = useState(true);
    const [transType, setType] = useState<"expense"|"income">("expense");
    
    const router = useRouter();

    const { id } = useLocalSearchParams<{id:string}>();

    const { editTransaction, transactions } = useBalanceStore();

    const {getAllExpenseCats, getAllIncomeCats} = useCategoryStore();

    useFocusEffect(useCallback(()=>{
        const trans = transactions.find((trans:any)=>trans.id === id);
        if(trans)
        {
            setAmount(trans.amount.toString());
            setCategory(trans.category);
            setTitle(trans.title);
            setDate(new Date(trans.date));
            setType(trans.type);
        }
    },[]))

    const handleSetAmount = (s:string) => {
        let res = s.trim();
        res = res.replace("-","");
        res = res.replace(",","");
        setAmount(res);
    }

    const onSave = ()=>{
        if(amount.trim() === "" || category.trim() === "")
        {
            Toast.show("Please fill the details", Toast.SHORT);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    editTransaction({
    id: id,
    amount: Number.parseInt(amount),
    date: date.toDateString(),
    title: title || category,
    type: transType,
    category: category,
  })
        router.back();
    }

  return (
    <GestureHandlerRootView style={[styles.container]}>
        <StatusBar style='dark'/>
        <View style={[styles.mainInputContainer]}>
            <View style={[styles.inputContainer, {width: '100%'}]}>                
            <TextInput style={[styles.input, {fontWeight: 'bold', width: '80%'}]} placeholder={(category)?category:"Title"} placeholderTextColor={Colors.gray}  keyboardType='default' onChangeText={setTitle} value={title}/>
            </View>

{/* //type */}
            <View style={[styles.inputContainer, {width: '100%'}]}>
            <SelectDropdown
    data={[{title: "income"}, {title: "expense"}]}
    onSelect={(selectedItem, index) => {
        Vibration.vibrate(5);
        setType(selectedItem.title);
    }}
    renderButton={(selectedItem, isOpened) => {

      return (
        <View style={styles.dropdownButtonStyle}>
          <Text style={[styles.dropdownButtonTxtStyle, (selectedItem && selectedItem.title)?{color: Colors.dark}:{color: Colors.gray}]}>
            {(selectedItem && selectedItem.title) || transType ||'Type'}
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

{/* categories  based on I or E*/}

            <View style={[styles.inputContainer, {width: '100%'}]}>
            <SelectDropdown
    data={(transType==="expense")?getAllExpenseCats():getAllIncomeCats()}
    onSelect={(selectedItem, index) => {
        Vibration.vibrate(5);
        setCategory(selectedItem.title);
    }}
    renderButton={(selectedItem, isOpened) => {

      return (
        <View style={styles.dropdownButtonStyle}>
          <Text style={[styles.dropdownButtonTxtStyle, (selectedItem && selectedItem.title)?{color: Colors.dark}:{color: Colors.gray}]}>
            {(selectedItem && selectedItem.title) || category ||'Category'}
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


            <View style={[styles.inputContainer, {width: '100%'}]}>                
                <TouchableOpacity style={{width: "100%", alignItems:"center", justifyContent:"center"}} onPress={()=>{Vibration.vibrate(10);setOpen(true); setGray(false)}}>                
                    <Text style={[styles.input, {color: (!gray)?Colors.dark:Colors.gray,fontWeight: 'bold', width: '80%'}]} >{`${date.getDate().toString().padStart(2,"0")}/${(date.getMonth()+1).toString().padStart(2,"0")}/${date.getFullYear()}, ${date.toString().split(' ')[0]}`}</Text>
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
                mode="date"    date={date} onDateChange={setDate}/>

            </View>
            <View style={[styles.inputContainer, {gap: 8,width: '100%'}]}>
                
                <Text style={{fontSize: 28, fontWeight: 'bold', color: Colors.dark}}>₹</Text>
              
                <TextInput style={[styles.input, {fontWeight: 'bold', width: '50%'}]} placeholder='Amount' placeholderTextColor={Colors.gray}  keyboardType='numeric' onChangeText={handleSetAmount} value={amount}/>
            </View>
        </View>
        <View style={{flex: 1}}/>
        <TouchableOpacity style={[defaultStyles.pillButton,styles.enabled, {marginBottom: 20}]} onPress={onSave}>
        <Text style={defaultStyles.buttonText}>Save</Text>
      </TouchableOpacity>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 10,
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
        marginLeft: -10,
        padding:20,
        backgroundColor: Colors.lightGray,
        borderRadius: 16,
        fontSize: 20,
        width: '80%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
      },
      dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.dark,
      },
      dropdownButtonArrowStyle: {
        fontSize: 28,
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