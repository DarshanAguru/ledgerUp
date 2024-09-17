import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "./mmkv-storage";

export interface category {
    id: string;
    name: string;
    color: string;
    type: string;
  
}


const defaultCats =  [
    { id: "1",name: "Groceries", color: "#FF6F61", type: "expense" },
    { id: "2",name: "Miscellaneous", color: "#6B5B95", type: "expense" },
    { id: "3",name: "Other", color: "#88B04B", type: "expense" },
    { id: "4",name: "Electricity", color: "#FFA07A", type: "expense" },
    { id: "5",name: "Home", color: "#F7CAC9", type: "expense" },
    { id: "6",name: "Entertainment", color: "#92A8D1", type: "expense" },
    { id: "7",name: "Transportation", color: "#F7786B", type: "expense" },
    { id: "8",name: "Health", color: "#034F84", type: "expense" },
    { id: "9",name: "PersonalCare", color: "#98DDDE", type: "expense" },
    { id: "10",name: "Shopping", color: "#DD4124", type: "expense" },
    { id: "11",name: "Education", color: "#B565A7", type: "expense" },
    { id: "12",name: "Hobbies", color: "#45B8AC", type: "expense" },
    { id: "13",name: "AccountTransfer", color: "#5B9AA0", type: "income" },
    { id: "14",name: "PocketMoney", color: "#9B2335", type: "income" },
    { id: "15",name: "Salary", color: "#55A630", type: "income" },
    { id: "16",name: "Family", color: "#6C5B7B", type: "expense" },
    { id: "17",name: "Fitness", color: "#E94B3C", type: "expense" },
    { id:"18",name: "Subscription", color: "#F4A688", type: "expense" },
    { id:"19",name: "Food", color: "#FFB347", type: "expense" },
    { id: "20",name: "Rent", color: "#4682B4", type: "expense" },
    { id: "21",name: "Monthly", color: "#AF69EF", type: "expense" },
    { id: "22",name: "Weekly", color: "#69B0E3", type: "expense" }
];



export interface categories{
    cats: Array<category>;
    addCat: (cat: category)=>void;
    deleteCat: (id:string)=>void;
    getCatCol: (id:string)=>string;
    getAllIncomeCats: ()=>Array<{title:string}>;
    getAllExpenseCats: ()=>Array<{title:string}>;
    editCat: (id: string, cat:category)=>void;
    deleteAllCats: ()=>void;
}

export const useCategoryStore = create<categories>()(
    persist((set,get)=>({
        cats: [...defaultCats],
        getCatCol: (name:string)=>{
            return get().cats.find((lst:any)=>lst.name === name)!.color!;
        },
        getAllExpenseCats: ()=>{
            return get().cats.filter((cat:any)=>cat.type === "expense").sort((a,b)=>(a.name.localeCompare(b.name))).map((cat:any)=>{
                return {title: cat.name};
            });
        },
        getAllIncomeCats: ()=>{
            return get().cats.filter((cat:any)=>cat.type === "income").sort((a,b)=>(a.name.localeCompare(b.name))).map((cat:any)=>{
                return {title: cat.name};
            });
        },
        editCat: (id:string, cat:category)=>{
            set((state)=>{
                const allCats= [...state.cats];
                const index = allCats.findIndex((cati)=>cati.id === id);
                allCats[index] = cat;
                // const sortedLists = [...allLists].sort((a,b)=> (new Date(b.id.split('@')[1]).valueOf() - new Date(a.id.split('@')[1]).valueOf()));
                return {cats: allCats};
            })
        },
        deleteCat: (id: string)=>{
            set((state)=> {
                const allCats = [...state.cats].filter((lst)=> lst.id !== id);
                // const sortedLists = [...allLists].sort((a,b)=> (new Date(b.id.split('@')[1]).valueOf() - new Date(a.id.split('@')[1]).valueOf()));
                return {cats: allCats};
            })
        },
        deleteAllCats: ()=>{set({cats: [...defaultCats]})},
        addCat: (cat:category)=>{
            set((state) => {
                const allCats = [...state.cats, cat];
                const sortedCats = [...allCats].sort((a,b)=> (a.name.localeCompare(b.name)));
                return {cats: sortedCats} 
            })
        },
    }), {
        name: 'cats',
        storage:createJSONStorage(()=>zustandStorage),
    })
)