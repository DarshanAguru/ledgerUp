
import HeaderTabs from '@/components/HeaderTabs'
import Colors from '@/constants/Colors'
import { FontAwesome } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { View } from 'react-native'

const Layout = () => {
  return (
    <Tabs  screenOptions={ 
        {
            tabBarActiveTintColor: Colors.primary,
            tabBarBackground: ()=><View style={{flex: 1, backgroundColor: '#F5F5F5BF'}}/>,
            tabBarStyle: {
              backgroundColor: '#F5F5F5BF',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              elevation: 0,
              borderTopWidth: 0,
            },
        }
        
    }>
      <Tabs.Screen name="home"  options={{ title: "Home", tabBarIcon: ({size, color})=>(<FontAwesome name="home" size={size} color={color}/>), header: ()=><HeaderTabs /> }}/>
      <Tabs.Screen name="history" options={ {title: "History", tabBarIcon: ({size, color})=>(<FontAwesome name="history" size={size} color={color}/>), header: ()=><HeaderTabs /> }}/>
      <Tabs.Screen name="analysis" options={ {title: "Spends", tabBarIcon: ({size, color})=>(<FontAwesome name="pie-chart" size={size} color={color}/>), header: ()=><HeaderTabs /> }}/>
      <Tabs.Screen name="lists" options={ {title: "Lists", tabBarIcon: ({size, color})=>(<FontAwesome name="list" size={size} color={color}/>), header: ()=><HeaderTabs /> }}/>
      <Tabs.Screen name="remainders" options={ {title: "Remainders", tabBarIcon: ({size, color})=>(<FontAwesome name="bell" size={size} color={color}/>), header: ()=><HeaderTabs /> }}/>
   </Tabs>
  )
}

export default Layout