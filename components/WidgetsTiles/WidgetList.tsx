import React from "react";


import { MARGIN } from "./Config";
import Tile from "./Tile";
import SortableList from "./SortableList";
import { View } from "react-native";
import * as Haptics from 'expo-haptics';

import { MMKV } from 'react-native-mmkv'

const storage = new MMKV({
  id:'tilesPos'
})

let tiles:any=[]

if(storage.getString('pos') === undefined)
{
  tiles = [
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

  storage.set('pos', JSON.stringify(tiles));
}
else{
  tiles = JSON.parse(storage.getString('pos')!);
}




const WidgetList = ({isPressed}:{isPressed:boolean}) => {
  return (
    <View
      style={{  paddingHorizontal: MARGIN , marginBottom: 0 }}
    >
      <SortableList
        editing={isPressed}
        onDragEnd={(positions) =>{
        let newTiles = [...tiles];
        newTiles[positions["income"]] = {id: "income"};
        newTiles[positions["expense"]] = {id: "expense"};
        newTiles[positions["spentChart"]] = {id: 'spentChart'};
        newTiles[positions["ier"]] = {id: "ier"};
         storage.set('pos', JSON.stringify(newTiles));
         console.log(newTiles);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        }
      >
        {tiles.map((tile:any, index:number) => (
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