import { View, Text, StyleSheet, Modal, TouchableOpacity, Vibration } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import {ScrollView, TextInput } from 'react-native-gesture-handler'
import Colors from '@/constants/Colors'
import { StatusBar } from 'expo-status-bar'
import ColorPicker, {Preview,Panel2, Panel1, HueSlider, OpacitySlider} from 'reanimated-color-picker';
import Toast from 'react-native-simple-toast';
import { useCategoryStore } from '@/store/categoryListStore'
import { useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const Page = () => {



    // const { remainders } = useRemaindersStore();
    const {  cats, addCat, editCat, deleteCat } = useCategoryStore();



    const [catsList, setCatsList] = useState<any>([]);

    const [catName, setCatName] = useState("");

    const [editId, setEditID] = useState("--");

    const [color,setColor] = useState("");

    
    const {id} = useLocalSearchParams<{id:string}>();

   

    const HandleNewCategory = () => {
        Vibration.vibrate(10);
        if(editId === "--")
        {
            const idcat = Math.random() + new Date().toISOString();
            addCat({id: idcat, name: "Category", color: Colors.dark, type: id});
            setCatsList(cats.filter((cat:any)=>cat.type === id));
            setEditID(idcat);
            setCatName("");
            setColor("");
        }
        else{
            Toast.show("Please add one category at a time", Toast.SHORT);
        }
      

    }

    const handleDelete = (idcat:string)=>{
        Vibration.vibrate(10);
        deleteCat(idcat);
        setCatsList(cats.filter((cat:any)=>cat.type === id));
        setEditID("--");
        setCatName("");
    }

    const handleColor = (idcat:string)=>{
        editCat(idcat, {id: idcat, name: catName, color: color, type: id});
        setCatsList(cats.filter((cat:any)=>cat.type === id));
        setEditID("--");
        setCatName("");
    }


    const handleSubmit = (e:any)=>{
        if(e.nativeEvent.text.trim() !== "")
        {
            if(catsList.find((cat:any)=>cat.name === catName) === undefined)
            {
                editCat(editId, {id: editId,name: catName, color: cats.find((cat:any)=>cat.id === editId)!.color!, type: id});
                setCatsList(cats.filter((cat:any)=>cat.type === id));
                setEditID("--");
                setCatName("");

            }
            else{
                Toast.show("Category name already exists", Toast.SHORT);
                deleteCat(editId);
                setCatsList(cats.filter((cat:any)=>cat.type === id));
                setCatName("");
                setEditID("--");
            }
        }
        else{
            editCat(editId, {id: editId, name: catName, color: cats.find((cat:any)=>cat.id === editId)!.color!, type: id});
            setCatsList(cats.filter((cat:any)=>cat.type === id));
            setEditID("--");
            setCatName("");
        }
    }
    const [showModal, setShowModal] = useState(false);


    const onSelectColor = ({ hex }:{hex:string}) => {
       setColor(hex);
      };
  

      useEffect(useCallback(()=>{
       setCatsList(cats.filter((cat:any)=>cat.type === id));
      },[cats]),[cats])
  


  return (
    <View style={{flex:1, backgroundColor:Colors.background, marginTop:-10}}>
        <View style={{alignItems: "center", width:"100%", justifyContent:"center", paddingVertical:8}}>
            <Text style={{fontSize: 26, fontWeight:"bold", color: Colors.dark}}>Edit {`${id.charAt(0).toUpperCase()}${id.slice(1)}`} Categories</Text>
        </View>
        <StatusBar style='dark'/>
        {(!catsList && catsList.length <= 0)
        && 
        <View style={{flex:1, alignItems:"center", justifyContent: "center"}}><Text style={{fontSize: 26, fontWeight: "bold", color:Colors.dark}}>No Categories</Text></View>
        }
        {(catsList && catsList.length>0) && 

        <ScrollView style={{backgroundColor: "#fff", padding:10, width:"100%", borderRadius: 16,maxHeight: "92%"}}>
            <View style={styles.remaindersContainer}>
                {
                    catsList.map((c:any,idx:number)=>(
                        <View key={idx} style={{flexDirection: "row",alignItems: "center", gap:10, width:"100%", marginBottom:20}}>
                            <TouchableOpacity onPress={()=>{Vibration.vibrate(5);setCatName(c.name);(c.id === editId)?setEditID("--"):setEditID(c.id)}}>
                                <Ionicons name={"pencil"} color={(editId === c.id)?Colors.dark:Colors.lightGray} size={22}/>
                            </TouchableOpacity>
                        <View  style={[styles.editButton, {alignItems:"center"}]} >
                            {(editId === c.id) && <TextInput style={{fontSize: 22,color: Colors.dark, fontWeight: 'bold', flex:1}} value={catName} onChangeText={setCatName} autoFocus autoCorrect placeholder='Category' keyboardType='default'  onSubmitEditing={handleSubmit}/>}
                            {(editId !== c.id) && <Text style={{fontSize: 22,color: Colors.dark, fontWeight: 'bold', flex:1}}>{c.name}</Text>}
                        <TouchableOpacity style={{width: "35%", borderRadius: 8,borderColor: "white", borderWidth: 2.5, height: 30, backgroundColor:c.color}} onPress={()=>{Vibration.vibrate(5);(editId === c.id)?setShowModal(true):setShowModal(false)}}/>
        {(editId === c.id && showModal) && <Modal style={{width:"80%", height: "100%", justifyContent: "center", alignItems:"center"}}>
        <ColorPicker value={c.color} adaptSpectrum={true} style={{alignSelf:"center", justifyContent:"center", paddingTop:"50%", width: '80%', gap:10 }} onComplete={onSelectColor}>
          <Preview  />
          <Panel1 />
          <HueSlider/>
          <OpacitySlider/>
        </ColorPicker>
        <View style={{flexDirection: "row", alignItems:"center", padding: 20}}>
        <TouchableOpacity style={{marginVertical: 10, borderRadius: 12, borderWidth:1, paddingHorizontal:30, paddingVertical: 10, borderColor: "#f00000" }} onPress={() => { Vibration.vibrate(10);setShowModal(false)}}>
                    <Text style={{fontSize: 20, fontWeight: "bold", color:Colors.dark}}>Cancel</Text>
        </TouchableOpacity>
                    <View style={{flex:1}}/>
        <TouchableOpacity style={{marginVertical: 10, borderRadius: 12, borderWidth:1, paddingHorizontal:30, paddingVertical: 10, borderColor:"#00b000"}} onPress={() => {Vibration.vibrate(10);handleColor(c.id);setShowModal(false)}}>
                    <Text style={{fontSize: 20, fontWeight: "bold", color:Colors.dark}}>OK</Text>
        </TouchableOpacity>
        </View>
        </Modal>
}
                    </View>
                    <TouchableOpacity onPress={()=>{handleDelete(c.id)}}>
                    <Ionicons name={"trash-outline"} color={"#f00000"} size={22}/>
                    </TouchableOpacity>
                    </View>
             
                    ))
                    
                }
                
             
            </View>
    </ScrollView>
        
        }
    
    <View style={{flex:1}}></View>
    <View style={{alignItems: "center", width:"100%", justifyContent:"center", paddingVertical:14}}>
    <TouchableOpacity style={[styles.addButton, {backgroundColor: (editId === "--")?Colors.dark:Colors.lightGray}]} onPress={HandleNewCategory} >
                    <Text style={{fontSize: 20, color: (editId === "--")?"#fff":Colors.gray, fontWeight: '500'}}> + Add Category</Text>
                </TouchableOpacity> 
    </View>
    </View>
  )
}


const styles = StyleSheet.create({
    remaindersContainer: {
        flexDirection: 'column',
        padding: 8,
        width: '85%',
    },

    addButton : {

        width: '80%',
        padding: 10,
        borderRadius: 14,
        backgroundColor: Colors.dark,
        fontSize: 20,
        alignItems: 'center',
        marginHorizontal:20,
    },

    editButton : {
        width: '100%',
        padding : 12,
        borderRadius: 12,
        backgroundColor: Colors.lightGray,
        flexDirection: 'row',
    },

    editButtonInternal : {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
    }

});

export default Page