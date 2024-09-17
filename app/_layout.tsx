import Colors from '@/constants/Colors';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Link, Stack, usePathname, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef} from 'react';
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, AppState, Vibration, View, Text } from 'react-native';
import { UserInactivityProvider } from '@/context/UserInactivity';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './utils/notifications';



const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key)
    } catch (error) {
      await SecureStore.deleteItemAsync(key)
      return null
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value)
    } catch (err) {
      return;
    }
  },
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
  
} from 'expo-router';





// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();


const InitialLayout = () => {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const router = useRouter();

 

  const { isLoaded, isSignedIn } = useAuth();

  const segments = useSegments();
  const pathName = usePathname();



  // Expo Router uses Error Boundaries to catch errors in the navigation tree

  useEffect(()=>{
    const subs = AppState.addEventListener("blur",async()=>{if((pathName === "/home" || pathName === "/history" || pathName === "/analysis") ) {router.push('/(modals)/white');} });
    const subs2 =  AppState.addEventListener("focus", async()=>{if (pathName==='/white'){  router.back();}});
    return ()=>{
      subs2.remove();
      subs.remove(); 
    }
  },[pathName])
   
  
  

  useEffect(() => {
  
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  


  

  useEffect(()=>{

    
    
    const register = async()=>{
    

      
      return await registerForPushNotificationsAsync();
    }

    if(!isLoaded ) return;
    //@ts-ignore
    const inAuthGroup = segments[0] === '(authenticated)';

    if( isSignedIn && !inAuthGroup)
    {
      
        register()
      //@ts-ignore
      router.replace('/(authenticated)/(modals)/lock');
    }
    else if(!isSignedIn)
    {
      router.replace('/')
    }

  }, [isSignedIn])

  if (!loaded || !isLoaded) {
    return <View style={{flex:1 , justifyContent: 'center'}}><ActivityIndicator   size={72} color={Colors.dark}/></View>;
  }

  return (
    <Stack>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="signup" options={{ 
      title: "", 
    headerBackTitle: "",
     headerShadowVisible: false,
      headerStyle: {backgroundColor: Colors.background}, 
      headerLeft: () => (<TouchableOpacity onPress={router.back}><Ionicons name="arrow-back" size={32} color={Colors.dark}/></TouchableOpacity>),
    }} />
     <Stack.Screen name="login" options={{ 
      title: "", 
    headerBackTitle: "",
     headerShadowVisible: false,
      headerStyle: {backgroundColor: Colors.background}, 
      headerLeft: () => (<TouchableOpacity onPress={router.back}><Ionicons name="arrow-back" size={32} color={Colors.dark}/></TouchableOpacity>),
    }} />



<Stack.Screen name="verify/[email]" options={{ 
      title: "", 
    headerBackTitle: "",
     headerShadowVisible: false,
      headerStyle: {backgroundColor: Colors.background}, 
      headerLeft: () => (<TouchableOpacity onPress={()=>{Vibration.vibrate(10);router.back()}}><Ionicons name="arrow-back" size={32} color={Colors.dark}/></TouchableOpacity>),
    }} />
    

<Stack.Screen name="(authenticated)/remainder/[id]" options={{ 
      title: "Edit Remainder", 
    headerBackTitle: "",
     headerShadowVisible: false,
      headerStyle: {backgroundColor: Colors.background}, 
      headerLeft: () => (<TouchableOpacity onPress={()=>{Vibration.vibrate(10);router.back()}}><Ionicons name="arrow-back" size={32} color={Colors.dark}/></TouchableOpacity>),
    }} />



<Stack.Screen name="(authenticated)/trans/[id]" options={{ 
      title: "Edit Transaction", 
    headerBackTitle: "",
     headerShadowVisible: false,
      headerStyle: {backgroundColor: Colors.background}, 
      headerLeft: () => (<TouchableOpacity onPress={()=>{Vibration.vibrate(10);router.back()}}><Ionicons name="arrow-back" size={32} color={Colors.dark}/></TouchableOpacity>),
    }} />


<Stack.Screen name="(authenticated)/cats/[id]" options={{ 
      title: "", 
    headerBackTitle: "",
     headerShadowVisible: false,
      headerStyle: {backgroundColor: Colors.background}, 
      headerLeft: () => (<TouchableOpacity onPress={()=>{Vibration.vibrate(10);router.back()}}><Ionicons name="arrow-back" size={32} color={Colors.dark}/></TouchableOpacity>),
    }} />



<Stack.Screen name="(authenticated)/lists/[id]" options={{ 
      title: "Edit List", 
    headerBackTitle: "",
     headerShadowVisible: false,
      headerStyle: {backgroundColor: Colors.background}, 
      headerLeft: () => (<TouchableOpacity onPress={()=>{Vibration.vibrate(10);router.back()}}><Ionicons name="arrow-back" size={32} color={Colors.dark}/></TouchableOpacity>),
    }} />




<Stack.Screen name="(authenticated)/analysisCategory/[id]" options={{ 
      title: "", 
    headerBackTitle: "",
     headerShadowVisible: false,
      animation: "slide_from_right",
      headerStyle: {backgroundColor: Colors.background}, 
      headerLeft: () => (<TouchableOpacity onPress={()=>{Vibration.vibrate(10);router.back()}}><Ionicons name="arrow-back" size={32} color={Colors.dark}/></TouchableOpacity>),
    }} />

<Stack.Screen name="(authenticated)/(modals)/addIncome" options={{headerShown: true, presentation: 'modal', title:"Income" ,animation: 'slide_from_left', headerTransparent: true, headerLeft : ()=>(
  <TouchableOpacity onPress={()=>{Vibration.vibrate(10);router.back()}}>
    <Ionicons name={'arrow-back'} size={26} color={'#000'} />
  </TouchableOpacity>
), headerRight: ()=>(<TouchableOpacity  onPress={()=>{Vibration.vibrate(10);router.push({pathname: '/(authenticated)/cats/[id]', params: {id: "income"}})}}>
  <Text style={{fontSize: 14, fontWeight: '500'}}>
  Edit Categories
  </Text>
</TouchableOpacity>)}} />
<Stack.Screen name="(authenticated)/(modals)/addExpense" options={{headerShown: true, presentation: 'modal', title:"Expense",animation: 'slide_from_right', headerTransparent: true, headerLeft : ()=>(
  <TouchableOpacity onPress={()=>{Vibration.vibrate(10);router.back()}}>
    <Ionicons name={'arrow-back'} size={26} color={'#000'} />
  </TouchableOpacity>
), headerRight: ()=>(<TouchableOpacity  onPress={()=>{Vibration.vibrate(10);router.push({pathname: '/(authenticated)/cats/[id]', params: {id: "expense"}})}}>
  <Text style={{fontSize: 14, fontWeight: '500'}}>
  Edit Categories
  </Text>
</TouchableOpacity>) 
}} />

<Stack.Screen name="(authenticated)/(modals)/addRemainder" options={{headerShown: true, presentation: 'modal', title:"New Remainder",animation: 'slide_from_right', headerTransparent: true, headerLeft : ()=>(
  <TouchableOpacity onPress={()=>{Vibration.vibrate(10);router.back()}}>
    <Ionicons name={'arrow-back'} size={26} color={'#000'} />
  </TouchableOpacity>
)}} />

<Stack.Screen name="(authenticated)/(modals)/addList" options={{headerShown: true, presentation: 'modal', title:"New List",animation: 'slide_from_right', headerTransparent: true, headerLeft : ()=>(
  <TouchableOpacity onPress={()=>{Vibration.vibrate(10);router.back()}}>
    <Ionicons name={'arrow-back'} size={26} color={'#000'} />
  </TouchableOpacity>
)}} />



  
<Stack.Screen name="(modals)/white" options={{headerShown: false,headerTransparent: true,animation:"none" , presentation: "modal"}} />

<Stack.Screen name="(authenticated)/(tabs)" options={ { headerShown: false}}/>
<Stack.Screen name="(authenticated)/(modals)/lock" options={{headerShown: false, animation: 'none'}} />
<Stack.Screen name="(authenticated)/(modals)/account" options={{presentation: 'modal', animation: 'fade_from_bottom', title: '', headerTransparent: true, headerLeft : ()=>(
  <TouchableOpacity onPress={()=>{Vibration.vibrate(10);router.back()}}>
    <Ionicons name={'close-outline'} size={34} color={'#000'} />
  </TouchableOpacity>
)}} />



<Stack.Screen name="(authenticated)/(modals)/about" options={{presentation: "transparentModal", animation: "fade", title: '', headerTransparent: true, headerLeft : ()=>(
  <TouchableOpacity onPress={()=>{Vibration.vibrate(10);router.back()}}>
    <Ionicons name={'close-outline'} size={34} color={'#fff'} />
  </TouchableOpacity>
)}} />

  </Stack>
  
  );

}

const  RootLayoutNav = () => {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
    <UserInactivityProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
    <InitialLayout />
    </GestureHandlerRootView>
    </UserInactivityProvider>
    </ClerkProvider>
  );
}

export default RootLayoutNav;
