import { View, Text, StyleSheet, Touchable, TouchableOpacity, Vibration, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler'
import Colors from '@/constants/Colors'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { Link, useFocusEffect, useRouter } from 'expo-router'
import { useListsStore } from '@/store/listsStore'
import Toast from 'react-native-simple-toast';
import * as Haptics from 'expo-haptics';



const Page = () => {

    const { lists, deleteList, setList } = useListsStore();
    const [allLists, setAllLists ]  = useState<any>([]);
    const [addCheckBox, setAddCheckBox] = useState(false);
    const [listsToDelete, setListsToDelete] = useState<any>([]);
    const router = useRouter();

    const HandleEditList = (id:string)=>{
        Vibration.vibrate(10);
        router.push({pathname: '/lists/[id]', params:{id: id}});


    }

    const getCompleted = (lstItems:any)=>{
        return lstItems.filter((item:any)=>item.isChecked === true).length || 0;
    }


    useFocusEffect(useCallback(()=>{
        const checkCondition = (itm:any)=>{
            if(itm.isRecurring === true)
            {
                const [w,d] = itm.recurringDate.split("@");
                if(w==="W")
                {
                    return (new Date().getDay() === Number(d));
                }
                if(w==="M")
                {
                    return (new Date().getDate() === new Date(d).getDate());
                }
                return false;
            }
            return false;
        }
        const lsts = lists.filter((itm:any)=>((itm.id.startsWith("$r$")) && (checkCondition(itm) === true)))
        lsts.forEach((lst:any)=>{
            if(!((new Date(lst.id.split("@")[1]).getDate() === new Date().getDate()) && (new Date(lst.id.split("@")[1]).getMonth() === new Date().getMonth())))
            {
                const date = new Date();
                const nid = "$r$"+Math.random().toString()+"&"+"List"+"&" + "@"+ date.toISOString();
                const lstItems = lst.listItems.map((item:any)=>{
                    const lid = Math.random().toString()+"&"+"ListItem"+"&" + "@"+ new Date().toISOString();
                    return {id: lid ,data: item.data, isChecked: false,amount: item.amount, hasAmount: item.hasAmount, transId: ""}
            });
                setList({
                    id: nid,
                    title: lst.title,
                    date: `${date.getDate().toString().padStart(2,"0")}/${(date.getMonth()+1).toString().padStart(2,"0")}/${date.getFullYear().toString().padStart(4,"0")}, ${date.toString().split(' ')[0]}`,
                    category: lst.category,
                    listItems: lstItems,
                    totalAmount: lst.totalAmount,
                    spentAmount: 0,
                    isCompleted: false,
                    addedToTransactions: false,
                    isRecurring: true,
                    recurringDate: new Date(new Date(lst.recurringDate).valueOf() + 30*24*60*60*1000).toISOString(),
                    notifId:lst.notifId,
                })

                deleteList(lst.id);
            }
        })



        const alllists = lists.sort((a,b)=> (new Date(a.id.split("@")[1]).valueOf() - new Date(b.id.split("@")[1]).valueOf())).sort((a,b)=> {
            if(a.isCompleted === b.isCompleted){
                return 0;
            }
            if(a.isCompleted === true){
                return 1;
            }
            else{
                return -1;
            }
        })



        setAllLists(alllists);
    },[lists]))


    const deleteSelectedLists = ()=>{
        listsToDelete.forEach((id:any)=>{
            deleteList(id);
        });
    }

    const HandleDeleteCheckedLists = ()=>{
        if(lists.length === 0)
        {
            Vibration.vibrate(10);
            Toast.show("Please add at least one list to delete", Toast.SHORT);
            return
        }
        if(addCheckBox === false)
        {
            Vibration.vibrate(10);
            setAddCheckBox(true);
            return;
        }
      
        if(listsToDelete.length > 0)
        { 

                  Alert.alert(" Are you sure you want to delete all selected lists?", "This action cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                onPress: () => {
                    deleteSelectedLists();
                    Toast.show("All selected lists are deleted successfully!", Toast.SHORT);
                    setAddCheckBox(false);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setListsToDelete([]);
                },
            },
        ]
    );
        }
        else{
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Toast.show("Please select at least one list to delete", Toast.SHORT);
        }
  
    }

    const HandleChecked = (id:string)=>{
        if(addCheckBox === true)
        {
            Vibration.vibrate(10);
            const getAllLists = listsToDelete.find((ID:any)=>ID === id);
            if (getAllLists === undefined)
            {
                setListsToDelete((prev:any)=>([...prev, id]));
            }
            else {
                setListsToDelete((prev:any)=>(prev.filter((ID:any)=>ID !== id)));
            }   
        }
    }

    const isInListToDelete = (id:string)=>{
        return listsToDelete.find((ID:any)=>ID === id);
    }

    const HandleNewList = () => {
        Vibration.vibrate(10);
        if(addCheckBox === true)
        {
            setAddCheckBox(false);
            return;
        }
        else{
            router.push('/(authenticated)/(modals)/addList');
        }
    }


    
  


  return (
   
        
        <GestureHandlerRootView style={[styles.container, {flex: 1}]}>
            <StatusBar style='dark'/>
            
            <ScrollView style={{flex:1, width: "100%", marginBottom: 100}}>
                {(allLists.length > 0) && (
                    allLists.map((lst:any,idx:any)=>(
                        <View key={idx}  style={{width: "100%",flexDirection: 'row', alignItems: "center"}}>
                        { (addCheckBox) && <TouchableOpacity style={{ width: "10%",justifyContent: 'center', alignItems: 'center'}} onPress={()=>{HandleChecked(lst.id)}}>
                         {(isInListToDelete(lst.id) === undefined) && <Ionicons name={'square-outline'} size={24} color={Colors.gray}/>}
                         {(isInListToDelete(lst.id) !== undefined) && <Ionicons name={'checkbox-outline'} size={24} color={Colors.dark}/>}
                    </TouchableOpacity>}
                        <TouchableOpacity style={[styles.editButton, { width: (addCheckBox)?"90%":"100%", marginBottom: 12}]} onPress={()=>{(!addCheckBox)?HandleEditList(lst.id):HandleChecked(lst.id)}}>
                    <Text style={{fontSize: 22,color: (lst.isCompleted)?Colors.gray:Colors.dark, fontStyle:(lst.isCompleted)?"italic" : "normal" ,fontWeight: 'bold', textDecorationLine: (lst.isCompleted)?"line-through":"none"}} >{lst.title}</Text>
                    {(lst.isCompleted) && <Text style={{fontSize: (addCheckBox)?12:16,color: Colors.gray, margin: 0, padding: 0 }}>Completed</Text>}
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                    <View style={styles.editButtonInternal}>
                    <Ionicons name={'time'} size={(addCheckBox)?12:16} color={Colors.gray}/>
                    <Text style={{fontSize: (addCheckBox)?12:14, color:Colors.gray}}>{lst.date}</Text>
                    </View>
                    <Ionicons name={'remove-outline'} size={(addCheckBox)?12:16} color={Colors.gray}/>
                    <View style={{flex:1}} >
                        <Text style={{fontSize: (addCheckBox)?12:14, color:Colors.gray}}>{lst.category}</Text>
                    </View>
                    {(lst.isRecurring) && <>
                    <View style={{flex:1}} >
                        <Text style={{fontSize: (addCheckBox)?12:14, color:"green"}}>{"Recurring"}</Text>
                    </View>
                    </>}
                    <View style={[styles.editButtonInternal, {alignItems: 'center'}]}>
                        <Text style={{fontSize: 14, color: Colors.gray}}> {getCompleted(lst.listItems)}/{lst.listItems.length}</Text>
                        <Ionicons name={'list'} size={16} color={Colors.gray}/>
                    </View>
                    </View>
                </TouchableOpacity>
                </View>
                    ))
                    
                )}

                {(allLists.length === 0) && 
                 <TouchableOpacity style={styles.editButton} onPress={()=>{Vibration.vibrate(10)}}>
                 <Text style={{fontSize: 20,color: Colors.gray, fontWeight: 'bold'}}>{"Click on 'New List' to add a new List"}</Text>
                 </TouchableOpacity>}
            </ScrollView>
                

                

                 
            <View style={{position: "absolute",bottom: 70,flexDirection: 'row', gap: 6}}> 
                  {(
                    <TouchableOpacity style={[styles.deleteButton, {backgroundColor: (addCheckBox)?"#f00000":Colors.dark, width: "50%"}]} onPress={HandleDeleteCheckedLists}>
                      <Text style={{fontSize: 18, color: "#fff", fontWeight: '500'}}> {(addCheckBox)?"Delete":"Select"} </Text>
                    </TouchableOpacity>
                  )}

                {( 
                <TouchableOpacity style={[styles.addButton, {width: "50%"}]} onPress={HandleNewList} >
                    <Text style={{fontSize: 18, color: "#fff", fontWeight: '500'}}> {(addCheckBox)?"Cancel":"New List"}</Text>
                </TouchableOpacity>
                )}
              


                </View>
               
           
        </GestureHandlerRootView>
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

    
    deleteButton : {
      padding: 10,
      borderRadius: 14,
      backgroundColor: "#f00000",
      fontSize: 20,
      alignItems: 'center',
      justifyContent: 'center',
  },

    addButton : {
        padding: 10,
        borderRadius: 14,
        backgroundColor: Colors.dark,
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