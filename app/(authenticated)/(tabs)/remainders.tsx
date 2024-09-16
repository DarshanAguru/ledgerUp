import { View, Text, StyleSheet, Touchable, TouchableOpacity, Vibration } from 'react-native'
import React, { useEffect } from 'react'
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler'
import { useHeaderHeight } from '@react-navigation/elements'
import Colors from '@/constants/Colors'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import { useRemaindersStore } from '@/store/remaindersStore'
import * as Notifications from 'expo-notifications';

const Page = () => {

    const headerHeight = useHeaderHeight();

    const { remainders } = useRemaindersStore();
    const router = useRouter();

    const HandleEditRemainder = (id:string)=>{
        Vibration.vibrate(10);
        router.push({pathname: '/remainder/[id]', params:{id: id}});

    }

    const HandleNewRemainder = () => {
        Vibration.vibrate(10);


    }


    useEffect(()=>{
        const getUrl = (notification:Notifications.Notification)=>{
          const url = notification.request.content.data.url;
          if(url)
          {
            router.push(url);
          }
        }
  
        Notifications.getLastNotificationResponseAsync()
        .then(response => {
          if (!response?.notification) {
            return;
          }
          getUrl(response?.notification);
        });
  
  
      },[])
  


  return (
    <ScrollView style={{backgroundColor: Colors.background}} contentContainerStyle={{paddingTop: headerHeight-200}}>
        <StatusBar style='dark'/>
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.remaindersContainer}>
                {(remainders.length > 0) && (
                    remainders.map((rem,idx)=>(
                        <TouchableOpacity key={idx} style={styles.editButton} onPress={()=>{HandleEditRemainder(rem.id)}}>
                    <Text style={{fontSize: 22,color: Colors.dark, fontWeight: 'bold'}}>{rem.title}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                    <View style={styles.editButtonInternal}>
                    <Ionicons name={'time'} size={16} color={Colors.gray}/>
                    <Text style={{fontSize: 14, color:Colors.gray}}>{`${new Date(rem.time).getHours().toString().padStart(2,"0")}:${new Date(rem.time).getMinutes().toString().padStart(2,"0")}`}</Text>
                    {(rem.repeat === "Weekly") && <Text style={{fontSize: 14, color:Colors.gray}}> {rem.day}</Text>}
                    </View>
                    <Ionicons name={'remove-outline'} size={14} color={Colors.gray} />
                    <Text style={{fontSize: 14, color:Colors.gray}}>{`${rem.repeat.charAt(0).toUpperCase()}${rem.repeat.slice(1)}`}</Text>
                    </View>
                </TouchableOpacity>
                    ))
                    
                )}
                
                {(remainders.length < 5) && ( <Link href="/(authenticated)/(modals)/addRemainder" asChild>
                <TouchableOpacity style={styles.addButton} onPress={HandleNewRemainder} >
                    <Text style={{fontSize: 20, color: Colors.gray, fontWeight: '500'}}> + Add Remainder</Text>
                </TouchableOpacity>
                </Link>)}
               
            </View>
        </GestureHandlerRootView>
    </ScrollView>
  )
}


const styles = StyleSheet.create({
    container: {
        padding : 20,
        alignItems : 'center',
        justifyContent: 'center',
    },
    remaindersContainer: {
        flexDirection: 'column',
        gap: 14,
        padding: 8,
        width: '100%',
    },

    addButton : {
        width: '100%',
        padding: 10,
        borderRadius: 14,
        backgroundColor: Colors.lightGray,
        fontSize: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    editButton : {
        width: '100%',
        padding : 14,
        borderRadius: 14,
        backgroundColor: Colors.lightGray,
        flexDirection: 'column',
        gap:8,
    },

    editButtonInternal : {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
    }

});

export default Page