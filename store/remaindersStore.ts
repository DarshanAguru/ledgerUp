
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "./mmkv-storage";

export interface Remainder {
    id: string;
    title: string;
    time: string;
    day: string;
    repeat: "Daily"|"Weekly";
    notifId: string,
}

export interface RemainderState{
    remainders: Array<Remainder>;
    setRemainder: (remainder:Remainder)=>void;
    deleteRemainder: (id:string)=>void;
    getRemainder: (id:string)=>Remainder;
    editRemainder: (id: string, remainder:Remainder)=>void;
    deleteAllRemainders: ()=>void;
}

export const useRemaindersStore = create<RemainderState>()(
    persist((set,get)=>({
        remainders: [],
        getRemainder: (id:string)=>{
            return get().remainders.find((rem)=>rem.id === id)!;
        },
        editRemainder: (id:string, remainder:Remainder)=>{
            set((state)=>{
                const allRemainders = [...state.remainders];
                const index = allRemainders.findIndex((rem)=>rem.id === id);
                allRemainders[index] = remainder;
                // const sortedRemainders = [...allRemainders].sort((a,b)=> (new Date(b.id.split('@')[1]).valueOf() - new Date(a.id.split('@')[1]).valueOf()));
                return {remainders: allRemainders};
            })
        },
        deleteRemainder: (id: string)=>{
            set((state)=> {
                const allRemainders = [...state.remainders].filter((rem)=> rem.id !== id);
                // const sortedRemainders = [...allRemainders].sort((a,b)=> (new Date(b.id.split('@')[1]).valueOf() - new Date(a.id.split('@')[1]).valueOf()));
                return {remainders: allRemainders};
            })
        },
        deleteAllRemainders: ()=>{
            set({remainders: []})
        },
        setRemainder: (remainder:Remainder)=>{
            set((state) => {
                const allRemainders = [...state.remainders, remainder];
                const sortedRemainders = [...allRemainders].sort((a,b)=> (new Date(b.id.split('@')[1]).valueOf() - new Date(a.id.split('@')[1]).valueOf()));
                return {remainders: sortedRemainders} 
            })
        },
    }), {
        name: 'remainders',
        storage:createJSONStorage(()=>zustandStorage),
    })
)