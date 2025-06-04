import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { all } from "axios";


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
        try {
            const res = await axiosInstance.post('/transaction/add', data);
            set((state) => ({ transactions: [...state.transactions, res.data] }));
            toast.success("Transaction added successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    deleteTransaction: async (id) => {
        try {
            await axiosInstance.delete(`/transaction/delete/${id}`);
            set((state) => ({
                transactions: state.transactions.filter((t) => t._id !== id)
            }));
            toast.success("Transaction deleted successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    addBudget: async (data) => {
        try{
            await axiosInstance.post('/transaction/addBudget',data);
            toast.success("Transaction added successfully");
        }
        catch (error){
            toast.error(error.response.data.message);
        }
    },
    getBudget: async () => {
        try {
            const res = await axiosInstance.get('/transaction/getBudget');
            set({ budgets: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
            console.error("Error fetching budgets:", error);
        }
    },
    deleteBudget: async (id) => {
        try {
            await axiosInstance.delete(`/transaction/deleteBudget/${id}`);
            set((state) => ({
                budgets: state.budgets.filter((b) => b._id !== id)
            }));
            toast.success("Budget deleted successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
    getAllBudget: async () => {
        try {
            const res = await axiosInstance.get('/transaction/getAllBudget');
            set({ allBudgets: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
            console.error("Error fetching all budgets:", error);
        }
    }
}));