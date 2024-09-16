import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "./mmkv-storage";

export interface category {
    name: string;
    color: string;
    type: string;
  
}


const defaultCats =  [
    { name: "Groceries", color: "#FF6F61", type: "expense" },
    { name: "Miscellaneous", color: "#6B5B95", type: "expense" },
    { name: "Other", color: "#88B04B", type: "expense" },
    { name: "Electricity", color: "#FFA07A", type: "expense" },
    { name: "Home", color: "#F7CAC9", type: "expense" },
    { name: "Entertainment", color: "#92A8D1", type: "expense" },
    { name: "Transportation", color: "#F7786B", type: "expense" },
    { name: "Health", color: "#034F84", type: "expense" },
    { name: "PersonalCare", color: "#98DDDE", type: "expense" },
    { name: "Shopping", color: "#DD4124", type: "expense" },
    { name: "Education", color: "#B565A7", type: "expense" },
    { name: "Hobbies", color: "#45B8AC", type: "expense" },
    { name: "AccountTransfer", color: "#5B9AA0", type: "income" },
    { name: "PocketMoney", color: "#9B2335", type: "income" },
    { name: "Salary", color: "#55A630", type: "income" },
    { name: "Family", color: "#6C5B7B", type: "expense" },
    { name: "Fitness", color: "#E94B3C", type: "expense" },
    { name: "Subscription", color: "#F4A688", type: "expense" },
    { name: "Food", color: "#FFB347", type: "expense" },
    { name: "Rent", color: "#4682B4", type: "expense" },
    { name: "Monthly", color: "#AF69EF", type: "expense" },
    { name: "Weekly", color: "#69B0E3", type: "expense" }
];



export interface categories{
    cats: Array<category>;
    addCat: (cat: category)=>void;
    deleteCat: (name:string)=>void;
    getCatCol: (name:string)=>string;
    getAllIncomeCats: ()=>Array<{title:string}>;
    getAllExpenseCats: ()=>Array<{title:string}>;
    editCat: (name: string, cat:category)=>void;
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
            return get().cats.filter((cat:any)=>cat.type === "income").sort((a,b)=>(a.name.localeCompare(b.name))).map((cat)=>{
                return {title: cat.name};
            });
        },
        editCat: (name:string, cat:category)=>{
            set((state)=>{
                const allCats= [...state.cats];
                const index = allCats.findIndex((cati)=>cati.name === name);
                allCats[index] = cat;
                // const sortedLists = [...allLists].sort((a,b)=> (new Date(b.id.split('@')[1]).valueOf() - new Date(a.id.split('@')[1]).valueOf()));
                return {cats: allCats};
            })
        },
        deleteCat: (name: string)=>{
            set((state)=> {
                const allCats = [...state.cats].filter((lst)=> lst.name !== name);
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