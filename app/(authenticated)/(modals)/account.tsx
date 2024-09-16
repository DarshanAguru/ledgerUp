import { View, Text, StyleSheet, Vibration, Alert} from 'react-native'
import React, { useCallback,  useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-expo'
import Colors from '@/constants/Colors';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useBalanceStore } from '@/store/balanceStore';
import Toast from 'react-native-simple-toast';
import { useRemaindersStore } from '@/store/remaindersStore';
import * as Notifications from 'expo-notifications';
import { useListsStore } from '@/store/listsStore';
import { useCategoryStore } from '@/store/categoryListStore';

const Page = () => {

    const { user } = useUser();
    const { signOut } = useAuth();
    const [firstName, setFirstName] = useState("");
    const [lastName, settLastName] = useState("");
    const [userName , setUserName] = useState("");
    const [edit , setEdit] = useState(false);

    const { deleteAllRemainders } = useRemaindersStore();
    const { clearTransactions } = useBalanceStore();
    const { deleteAllLists } = useListsStore();
    const {deleteAllCats} = useCategoryStore();

    const router = useRouter();

    const onSaveUser = async() => {
        Vibration.vibrate(10);
        try{
            await user?.update({firstName:firstName.trim()!, lastName:lastName.trim()!});
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setUserName(`${(user?.firstName)?.at(0)?.toLocaleUpperCase()}${(user?.lastName)?.at(0)?.toLocaleUpperCase()}`);
        }
        catch(err)
        {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        finally{
            setEdit(false);
        }
    }

    const handleLogOut =  async() => {
        Vibration.vibrate(10);
        Alert.alert("Sure Logout?", 
            "Please note that all your transactions history, lists and remainders will be cleared once you logout!",
            [{
                text : "Cancel", 
                onPress: ()=>{Vibration.vibrate(10)}, 
                style: "cancel"
            }, 
            {
                text: "Logout", 
                onPress: async()=>{Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) ;
                    await signOut(); 
                    clearTransactions();
                    deleteAllRemainders();
                    deleteAllLists();
                    deleteAllCats();
                    await Notifications.cancelAllScheduledNotificationsAsync();
                }
            }
        ]);

    }

    const handleClearHistory = () =>{
        Alert.alert("Sure Clear History?","Please note that once history is cleared you can't retrieve it.",  [{
            text : "Cancel", 
            onPress: ()=>{Vibration.vibrate(10)}, 
            style: "cancel"
        }, 
        {
            text: "Clear History", 
            onPress: async()=>{Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) ;
                clearTransactions();
                Toast.show("History cleared successfully", Toast.SHORT);
            }
        }
    ])
        clearTransactions();
    }

    const handleAbout = () =>{
        Vibration.vibrate(10);
        //@ts-ignore
        router.push('/(modals)/about');
    }

    useFocusEffect(useCallback(()=>{
        setFirstName(`${user?.firstName}`);
        settLastName(`${user?.lastName}`);
        setUserName(`${(user?.firstName)?.at(0)?.toLocaleUpperCase()}${(user?.lastName)?.at(0)?.toLocaleUpperCase()}`);
    },[]))
  return (
    <View  style={{flex: 1,paddingTop: 100, backgroundColor: 'rgba(255,255,255,1)'}}>
      <View style={{alignItems:'center'}}>
        <View style={styles.roundImg}>
            <Text style={styles.roundImgText}>{userName}</Text>
        </View>
        {
            !edit && (<View style={styles.editRow}>
                <Text style={{color: '#000', fontSize: 32, fontWeight: 'bold'}}>
                    {firstName} {lastName}
                </Text>
                <TouchableOpacity style={{alignItems: 'center'}} onPress={()=>{Vibration.vibrate(10); setEdit(true)}}>
                    <Ionicons  name={'ellipsis-horizontal'} size={28} color={'black'}/>
                </TouchableOpacity>
            </View>)
        }
        {
            edit && (
                <View style={styles.editRow}>
                    <TextInput placeholder='First Name' style={styles.inputTextField} value={firstName || ""} onChangeText={setFirstName}/>
                    <TextInput placeholder='Last Name' style={styles.inputTextField} value={lastName || ""} onChangeText={settLastName}/>
                    <TouchableOpacity style={{alignItems: 'center'}} onPress={()=>onSaveUser()}>
                    <Ionicons  name={'checkmark-outline'} size={30} color={'black'}/>
                </TouchableOpacity>
                </View>
            )
        }

        <View style={styles.optionsMenu}>
            <TouchableOpacity style={styles.optionBtn} onPress={()=>handleClearHistory()}>
            <MaterialCommunityIcons name={'broom'} size={22} color={'#000'} />
            <Text style={{color: '#000', fontSize: 20}}>Clear History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionBtn} onPress={()=>handleLogOut()}>
                <Ionicons  name={'log-out'} size={22} color={'#000'}/>
                <Text style={{color: '#000', fontSize: 20}}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionBtn} onPress={()=>handleAbout()}>
                <Ionicons  name={'information-circle'} size={22} color={'#000'}/>
                <Text style={{color: '#000', fontSize: 20}}>About</Text>
            </TouchableOpacity>
        </View>
        
      </View>
    </View>
  )
}


const styles=  StyleSheet.create({
    roundImg: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: Colors.dark,
        justifyContent: 'center',
        alignItems: 'center',
    },


    roundImgText : {
        color: 'white',
        fontSize: 68,
        fontWeight: 'bold',
        letterSpacing: 2,
    },

    editRow  : {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        gap: 12,
    },

    inputTextField: {
        width: 150,
        height: 60,
        borderWidth: 2,
        borderColor: Colors.gray,
        borderRadius: 14,
        padding : 8,
        color: '#000',
        fontSize: 24,
        alignItems : 'center',
    },

    optionsMenu: {
        backgroundColor: 'rgba(10,10,10,0.05)',
        borderRadius: 14,
        padding: 4,
        gap: 8,
        margin: 20,
        width: '85%',
    },

    optionBtn : {
        padding :14,
        flexDirection: 'row',
        gap: 20,
        alignItems: 'center',
    },


})

export default Page