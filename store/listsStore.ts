
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "./mmkv-storage";

export interface ListItem {
    id: string;
    isChecked: boolean;
    data: string;
    amount: number;
    hasAmount: boolean;
    transId: string;
  
}

export interface Lists {
    id: string;
    title: string;
    date: string;
    category: "Weekly" | "Monthly" | "Groceries" | "Other" | "None";
    listItems: Array<ListItem>;
    totalAmount: number;
    spentAmount: number;
    isCompleted: boolean;
    addedToTransactions: boolean;
    isRecurring: boolean;
    recurringDate: string;
    notifId: string;
}

export interface ListState{
    lists: Array<Lists>;
    setList: (list:Lists)=>void;
    deleteList: (id:string)=>void;
    getList: (id:string)=>Lists;
    editList: (id: string, list:Lists)=>void;
    deleteAllLists: ()=>void;
}

export const useListsStore = create<ListState>()(
    persist((set,get)=>({
        lists: [],
        getList: (id:string)=>{
            return get().lists.find((lst)=>lst.id === id)!;
        },
        editList: (id:string, list:Lists)=>{
            set((state)=>{
                const allLists= [...state.lists];
                const index = allLists.findIndex((rem)=>rem.id === id);
                allLists[index] = list;
                // const sortedLists = [...allLists].sort((a,b)=> (new Date(b.id.split('@')[1]).valueOf() - new Date(a.id.split('@')[1]).valueOf()));
                return {lists: allLists};
            })
        },
        deleteList: (id: string)=>{
            set((state)=> {
                const allLists = [...state.lists].filter((lst)=> lst.id !== id);
                // const sortedLists = [...allLists].sort((a,b)=> (new Date(b.id.split('@')[1]).valueOf() - new Date(a.id.split('@')[1]).valueOf()));
                return {lists: allLists};
            })
        },
        deleteAllLists: ()=>{set({lists: []})},
        setList: (list:Lists)=>{
            set((state) => {
                const allLists = [...state.lists, list];
                const sortedLists = [...allLists].sort((a,b)=> (new Date(b.id.split('@')[1]).valueOf() - new Date(a.id.split('@')[1]).valueOf()));
                return {lists: sortedLists} 
            })
        },
    }), {
        name: 'lists',
        storage:createJSONStorage(()=>zustandStorage),
    })
)