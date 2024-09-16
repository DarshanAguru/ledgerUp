
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "./mmkv-storage";

export interface Transaction {
    id: string;
    amount: number;
    date: string;
    title: string;
    type: "expense" | "income";
    category: string;
}


export interface TransactionFilters {
    type?: "expense" | "income";
    category?: string;
    duration?: "day"|"week"|"month"|"threeMonths";
}

export interface BalanceState{
    transactions: Array<Transaction>;
    getTotalExpenseThisMonth: () => number;
    getTotalIncomeThisMonth: () => number;
    editTransaction: (transaction: Transaction)=>void;
    runTransactions: (transaction: Transaction)=>void;
    filterTransactions: (filters?:TransactionFilters)=>Array<Transaction>|null;
    balance: ()=>number;
    deleteTransaction : (id:string)=>void;
    clearTransactions: ()=>void;
}

const daysDiff = (d1:string,d2:string)=>{
    const date1 = new Date(d1).valueOf();
    const date2 = new Date(d2).valueOf(); 
    const td = Math.abs(date2-date1);
    const dd = Math.ceil(td/(1000*60*60*24));
    return dd;
}

export const useBalanceStore = create<BalanceState>()(
    persist((set,get)=>({
        transactions: [],
        getTotalExpenseThisMonth: () => {
            return get().transactions.filter((trans)=>trans.type === "expense").filter((trans)=>(new Date(trans.date).getMonth() === new Date().getMonth())).reduce((acc,t)=>acc + t.amount, 0);
        },
        getTotalIncomeThisMonth: () => {
            return get().transactions.filter((trans)=>trans.type === "income").filter((trans)=>(new Date(trans.date).getMonth() === new Date().getMonth())).reduce((acc,t)=>acc + t.amount, 0);  
        },
        filterTransactions: (filters?: TransactionFilters)=> {
            let allTrans = get().transactions;
            if(allTrans.length > 0 && filters?.type) allTrans = allTrans.filter((trans)=>trans.type === filters.type);
            if(allTrans.length > 0 && filters?.category) allTrans = allTrans.filter((trans)=>trans.category === filters.category);
            if(allTrans.length > 0 && filters?.duration) 
                {
                  if(filters.duration === "day")
                    {
                        allTrans = allTrans.filter((trans)=>(new Date(trans.date).getDate() === new Date().getDate()));
                    }
                    else if (filters.duration === "week")
                        {
                            allTrans = allTrans.filter((trans)=>{
                                return daysDiff(trans.date, new Date().toISOString()) <= 7;
                            });
                        }
                    else if (filters.duration === "month")
                    {
                        allTrans = allTrans.filter((trans)=>{
                            return daysDiff(trans.date, new Date().toISOString()) <= 30;
                        });

                    }
                    else if (filters.duration === "threeMonths"){
                        allTrans = allTrans.filter((trans)=>{
                            return daysDiff(trans.date, new Date().toISOString()) <= 90;
                        });
                    }
                    else{
                        return allTrans = [];
                    }
                }
            return (allTrans.length > 0 ) ? allTrans : null;
        },
        editTransaction: (transaction: Transaction)=>{
            set((state)=>{
                let allTrans = state.transactions;
                const index = allTrans.findIndex((trans)=>trans.id === transaction.id);
                if(index !== -1)
                {
                    allTrans[index] = transaction;
                }
                else{
                    allTrans = [...allTrans, transaction];
                }
                const sortedTransactions = [...allTrans].sort((a,b)=> (new Date(b.id.split('@')[1]).valueOf() - new Date(a.id.split('@')[1]).valueOf()));
                return {transactions: sortedTransactions}
            })
          
        },
        runTransactions: (transaction: Transaction)=>{
            set((state) => {
                const allTransactions = [...state.transactions, transaction];
                const sortedTransactions = [...allTransactions].sort((a,b)=> (new Date(b.id.split('@')[1]).valueOf() - new Date(a.id.split('@')[1]).valueOf()));
                return {transactions: sortedTransactions} 
            })
        },
        deleteTransaction: (id:string)=>{
            set((state)=>{
                const allTransactions = [...state.transactions].filter((trans)=>trans.id !== id);
                // const sortedTransactions = [...allTransactions].sort((a,b)=> (new Date(b.id.split('@')[1]).valueOf() - new Date(a.id.split('@')[1]).valueOf()));
                return {transactions: allTransactions} 
            })
        },
        balance: ()=>{
            const allTrans = get().transactions;
            if(allTrans.length === 0) return 0;
            const totalIncome = allTrans.filter((trans)=>trans.type === "income").reduce((acc,t)=>acc + t.amount, 0);
            const totalExpense = allTrans.filter((trans)=>trans.type === "expense").reduce((acc,t)=>acc + t.amount, 0);
            return totalIncome - totalExpense;
        },
        clearTransactions: ()=>{set({transactions: []})},
    }), {
        name: 'balance',
        storage:createJSONStorage(()=>zustandStorage),
    })
)