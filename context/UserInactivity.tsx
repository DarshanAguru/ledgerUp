
import { useAuth } from "@clerk/clerk-expo";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";



export const UserInactivityProvider  = ({children}:{children:any}) => {
   
    const appState = useRef(AppState.currentState);
    const router = useRouter();
    const { isSignedIn } = useAuth();
  

    
    useEffect(useCallback(()=>{
        const subscription = AppState.addEventListener('change',handleAppStateChange);
        return ()=>{
            subscription.remove();
        };
    },[router]),[]);




    const handleAppStateChange = (nextAppState:AppStateStatus)=>{

        
        const previousAppState = appState.current;
        appState.current = nextAppState;
        
        if (nextAppState === 'background' || nextAppState === 'inactive') {
            if (isSignedIn) {
           
              if(router.canDismiss())
                {
                  router.dismissAll();
                }
                

                router.replace("/(modals)/white");
              
            }
          }


       
          
          if (nextAppState === 'active' && previousAppState === 'background') {
            if (isSignedIn) {
            if(router.canDismiss())
            {
              router.dismissAll();
            }
                router.replace("/(authenticated)/(modals)/lock");
            }
          }
      
    };


    return children;
}