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
import { useRouter } from 'expo-router'
import { useRemaindersStore } from '@/store/remaindersStore'
import { schedulePushNotification} from '@/app/utils/notifications'



const categoriesData: any = [
    {title: 'Daily'},
    {title: 'Weekly'},
];
  

const daysData: any = [
    {title: 'Monday'},
    {title: 'Tuesday'},
    {title: 'Wednesday'},
    {title: 'Thursday'},
    {title: 'Friday'},
    {title: 'Saturday'},
    {title: 'Sunday'},
];



const Page = () => {


  

    const [category,  setCategory] = useState("");
    const [day,  setDay] = useState("");
    const [title, setTitle] = useState("");
    const [time , setTime] = useState(new Date(new Date().setHours(20,0,0,0)));
    const [open, setOpen] = useState(false);    
    const [gray, setGray] = useState(true);
    
    const router = useRouter();

    const { setRemainder } = useRemaindersStore();

    
    const onSave = async()=>{
        let weekday = null;
        if(category === "Weekly")
        {
          weekday = (day === "Sunday")?1:(day === "Monday")?2:(day === "Tuesday")?3:(day === "Wednesday")?4:(day === "Thursday")?5:(day === "Friday")?6:(day === "Saturday")?7:null;
        }

        const trigger = {hour: time.getHours(), minute: time.getMinutes(), weekday: weekday};
        const cate = (category==="Daily")?"Daily Accounting Remainder":(category === "Weekly")?"Weekly Accounting Remainder":"";
        const notifId = await schedulePushNotification({
          title: "Remainder!",
          body: title || cate,
          url: '/(authenticated)/(tabs)/home',
          trigger: trigger,
          repeats: true,
        });

        if(category.trim() === "")
        {
            Toast.show("Please fill the details", Toast.SHORT);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        if(category === "Weekly" && day.trim() === "")
        {
          Toast.show("Please fill the details", Toast.SHORT);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
        }


    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const currDate=  new Date().toISOString();
    const cat = (category==="Daily")?"Daily Accounting Remainder":(category === "Weekly")?"Weekly Accounting Remainder":"";
    setRemainder({
      id: Math.random().toString() + "@"+ currDate,
      title: title || cat,
      time: time.toISOString(),
      day: (category==="Weekly")?day:"",
      repeat: (category==="Weekly")?"Weekly":"Daily",
      notifId: notifId,
    })
        router.back();
    }


   

  return (
    <GestureHandlerRootView style={[styles.container]}>
        <StatusBar style='dark'/>
        <View style={[styles.mainInputContainer]}>
            <View style={[styles.inputContainer, {width: '100%'}]}>                
            <TextInput style={[styles.input, {fontWeight: 'bold', width: '80%'}]} placeholder={(category==="Daily")?"Daily Accounting Remainder":(category === "Weekly")?"Weekly Accounting Remainder":"Title"} placeholderTextColor={Colors.gray}  keyboardType='default' onChangeText={setTitle} value={title}/>
            </View>
            <View style={[styles.inputContainer, {width: '100%'}]}>
            <SelectDropdown
    data={categoriesData}
    onSelect={(selectedItem, index) => {
        Vibration.vibrate(5);
        setCategory(selectedItem.title);
    }}
    renderButton={(selectedItem, isOpened) => {

      return (
        <View style={styles.dropdownButtonStyle}>
          <Text style={[styles.dropdownButtonTxtStyle, (selectedItem && selectedItem.title)?{color: Colors.dark}:{color: Colors.gray}]}>
            {(selectedItem && selectedItem.title) || 'Repeat'}
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

            {
              (category==="Weekly") && (
                <View style={[styles.inputContainer, {width: '100%'}]}>
                <SelectDropdown
        data={daysData}
        onSelect={(selectedItem, index) => {
            Vibration.vibrate(5);
            setDay(selectedItem.title);
        }}
        renderButton={(selectedItem, isOpened) => {
    
          return (
            <View style={styles.dropdownButtonStyle}>
              <Text style={[styles.dropdownButtonTxtStyle, (selectedItem && selectedItem.title)?{color: Colors.dark}:{color: Colors.gray}]}>
                {(selectedItem && selectedItem.title) || 'Day'}
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
              )

            }
            
            {(<View style={[styles.inputContainer, {width: '100%'}]}>                
                <TouchableOpacity style={{width: "100%", alignItems:"center", justifyContent:"center"}} onPress={()=>{Vibration.vibrate(10);setOpen(true); setGray(false)}}>          
                    <Text style={[styles.input, {color: (!gray)?Colors.dark:Colors.gray,fontWeight: 'bold', width: '80%'}]} >{`${time.getHours().toString().padStart(2,"0")}:${time.getMinutes().toString().padStart(2,"0")}`}</Text>
                </TouchableOpacity>
                <DatePicker modal open={open} onConfirm={(date)=>{
                    setOpen(false);
                    setTime(date);
                }}
                onCancel={()=>{setOpen(false)}} 
                theme="light"
                mode={"time"}    date={time} onDateChange={setTime}/>

            </View>)}
        </View>
        <View style={{flex: 1}}/>
        <TouchableOpacity style={[defaultStyles.pillButton,(category.trim() === "") ? styles.disabled:styles.enabled, {marginBottom: 20}]} onPress={onSave}>
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