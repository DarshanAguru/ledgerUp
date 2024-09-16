
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
;

export const registerForPushNotificationsAsync = async()=> {
   
  
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
     
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      
  
      
    } else {
      alert("Must use physical device for Push Notifications");
    }
  
    return;
  }

  export const scheduleListNotification = async ({title, body, type, param}: {title:string, body:string,type:string, param:string })=>{

    
      let trig = {}
      if(type === "W")
      {
        trig = {
          hour : 9,
          minute : 0,
          weekday : Number(param)+1,
          channelId: 'default',
          repeats: true
        }
      }
      else if (type === "M"){
        trig = {
          seconds: 30*24*60*60,
          channelId: 'default',
          repeats: true
        }
        }
        else{
          return "";
        }

        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `${title} 🔔`,
            body: body,
          },
          trigger: trig,
        });
        return id;
      }
  

  export const schedulePushNotification = async ({title, body,url,trigger,repeats}:{title:string, body:string,url:string,trigger:{hour:number;minute:number;weekday:number|null}, repeats:boolean})=> {
    
    
      let trig = {}
    if(trigger.weekday !== null)
    {
        trig= {
            hour: trigger.hour,
            minute: trigger.minute,
            weekday: trigger.weekday,
            channelId: 'default',
            repeats: repeats
        }
    }
    else{
        trig= {
            hour: trigger.hour,
            minute: trigger.minute,
            channelId: 'default',
            repeats: repeats
        }
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${title} 🔔`,
        body: body,
        data: { url: url},
      },
      trigger: trig,
    });
    
    
      return id;

  }

  export const cancelScheduledNotification = async (id:string)=>{
    await Notifications.cancelScheduledNotificationAsync(id);
}
  


 
  