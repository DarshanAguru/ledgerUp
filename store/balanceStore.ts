
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
    bal:number;
    getTotalExpenseThisMonth: () => number;
    getTotalIncomeThisMonth: () => number;
    editTransaction: (transaction: Transaction)=>void;
    runTransactions: (transaction: Transaction)=>void;
    filterTransactions: (filters?:TransactionFilters)=>Array<Transaction>|null;
    balance: ()=>number;
    deleteTransaction : (id:string)=>void;
    clearTransactions: (filter:string)=>void;
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
        bal: 0,
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
                        allTrans = allTrans.filter((trans)=>{ return  daysDiff(trans.date, new Date().toISOString()) <= 1});
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
                let newBal = state.bal;
                if(index !== -1)
                {
                    newBal = newBal + ((allTrans[index].type === "income")?-allTrans[index].amount:allTrans[index].amount);
                    newBal = newBal + ((transaction.type === "income")?transaction.amount:-transaction.amount);
                    allTrans[index] = transaction;
                }
                else{
                    newBal = newBal + ((transaction.type === "income")?transaction.amount:-transaction.amount);
                    allTrans = [...allTrans, transaction];
                }
                const sortedTransactions = [...allTrans].sort((a,b)=> (new Date(b.id.split('@')[1]).valueOf() - new Date(a.id.split('@')[1]).valueOf()));

                return {transactions: sortedTransactions, bal : newBal};
            })
          
        },
        runTransactions: (transaction: Transaction)=>{
            set((state) => {
                const allTransactions = [...state.transactions, transaction];
                const sortedTransactions = [...allTransactions].sort((a,b)=> (new Date(b.id.split('@')[1]).valueOf() - new Date(a.id.split('@')[1]).valueOf()));
                const newBal = state.bal + ((transaction.type === "income")?transaction.amount:-transaction.amount);
                return {transactions: sortedTransactions,bal:newBal} 
            })
        },
        deleteTransaction: (id:string)=>{
            set((state)=>{
                const allTransactions = [...state.transactions].filter((trans)=>trans.id !== id);
                // const sortedTransactions = [...allTransactions].sort((a,b)=> (new Date(b.id.split('@')[1]).valueOf() - new Date(a.id.split('@')[1]).valueOf()));
                const currTrans = [...state.transactions].filter((trans)=>trans.id === id)[0];
                let newBal = state.bal;
                if(daysDiff(currTrans.date, new Date().toISOString()) > 90)
                {
                    newBal = newBal;
                }
                else{
                    newBal = newBal + ((currTrans.type === "income")?-currTrans.amount:currTrans.amount);
                }
                return {transactions: allTransactions, bal:newBal} 
            })
        },
        balance: ()=>{
            return get().bal;
        },
        clearTransactions: (filter:string)=>{set((state)=>{
            if(filter === "this week")
            {
                const allTransactions = state.transactions.filter((trans)=>daysDiff(trans.date, new Date().toISOString()) >= 7);
                const thisWeekTrans = state.transactions.filter((trans)=>daysDiff(trans.date, new Date().toISOString()) <= 7);
                const newBal = thisWeekTrans.reduce((acc,t)=>acc + ((t.type === "income")?-t.amount:t.amount), 0);
                const updatedBal = state.bal + newBal;
                return {transactions: allTransactions, bal:updatedBal}
            }
            else if (filter === "this month")
            {
                const allTransactions = state.transactions.filter((trans)=>daysDiff(trans.date, new Date().toISOString()) >= 30);
                const thisMonthTrans = state.transactions.filter((trans)=>daysDiff(trans.date, new Date().toISOString()) <= 30);
                const newBal = thisMonthTrans.reduce((acc,t)=>acc + ((t.type === "income")?-t.amount:t.amount), 0);
                const updatedBal = state.bal + newBal;
                return {transactions: allTransactions, bal : updatedBal}
            }
            else{
                return {transactions: [], bal:0}
            }
        })},
    }), {
        name: 'balance',
        storage:createJSONStorage(()=>zustandStorage),
    })
)