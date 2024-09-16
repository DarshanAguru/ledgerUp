import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Colors from '@/constants/Colors'


type RoundButtonsProps = {
    text: string,
    icon: typeof Ionicons.defaultProps,
    onPress: () => void,
}

const RoundButtons = React.forwardRef(({text, icon, onPress}: RoundButtonsProps, ref?) => {
    return (
      <TouchableOpacity  style={styles.container} onPress={onPress}>
          <View style={styles.circle}>
              <Ionicons name={icon} size={32} color={Colors.dark}/>
          </View>
          <Text style={styles.label}>{text}</Text>
      </TouchableOpacity>
    );
  });

const styles = StyleSheet.create({
    container:{
        alignItems: 'center',
        gap: 10,
    },
    circle: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: Colors.lightGray,
        alignItems: 'center',
        justifyContent: 'center',
    },

    label : {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.dark
    }
})

export default RoundButtons