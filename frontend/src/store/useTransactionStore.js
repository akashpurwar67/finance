import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";



export const useTransactionStore = create((set) => ({
    transactions: [],
    budgets: [],
    allBudgets: [],
    isLoading: false,

    fetchTransactions: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get('/transaction/gettransaction');
            set({ transactions: res.data });
        } catch (error) {
            toast.error("Failed to fetch transactions");
            console.error("Error fetching transactions:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    addTransaction: async (data) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.post('/transaction/add', data);
            set((state) => ({ transactions: [...state.transactions, res.data] }));
           
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isLoading: false });
        }
    },

    deleteTransaction: async (id) => {
        set({ isLoading: true });
        try {
            await axiosInstance.delete(`/transaction/delete/${id}`);
            set((state) => ({
                transactions: state.transactions.filter((t) => t._id !== id)
            }));
          
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isLoading: false });
        }
    },

    addBudget: async (data) => {
        set({ isLoading: true });
        try{
            await axiosInstance.post('/transaction/addBudget',data);
           
        }
        catch (error){
            toast.error(error.response.data.message);
        } finally {
            set({ isLoading: false });
        }
    },
    getBudget: async () => {
        try {
            const res = await axiosInstance.get('/transaction/getBudget');
            set({ budgets: res.data });
        } catch (error) {
            
            console.error("Error fetching budgets:", error);
        }
    },
    deleteBudget: async (id) => {
        set({ isLoading: true });
        try {
            await axiosInstance.delete(`/transaction/deleteBudget/${id}`);
            set((state) => ({
                budgets: state.budgets.filter((b) => b._id !== id)
            }));
            
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isLoading: false });
        }
    },
    getAllBudget: async () => {
        try {
            const res = await axiosInstance.get('/transaction/getAllBudget');
            set({ allBudgets: res.data });
        } catch (error) {
            
            console.error("Error fetching all budgets:", error);
        }
    }
}));