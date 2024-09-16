import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { MARGIN } from "./Config";
import Tile from "./Tile";
import SortableList from "./SortableList";
import { View } from "react-native";
import * as Haptics from 'expo-haptics';

const tiles = [
  {
    id: "income",
  },
  {
    id: "expense",
  },
  {
    id: 'spentChart',
  },
  {
    id: "ier",
  },
];

const WidgetList = ({isPressed}:{isPressed:boolean}) => {
  return (
    <View
      style={{  paddingHorizontal: MARGIN , marginBottom: 0 }}
    >
      <SortableList
        editing={isPressed}
        onDragEnd={(positions) =>{
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        }
      >
        {tiles.map((tile, index) => (
          <Tile
            onLongPress={() => {return true}}
            key={tile.id + "-" + index}
            id={tile.id}
          />
        ))}
      </SortableList>
    </View>
  );
};

export default WidgetList;