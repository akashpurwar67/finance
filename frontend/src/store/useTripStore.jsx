import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useTripStore = create((set => ({
    trips: [],
    trip: null,
    isLoading: false,


    createTrip: async (data) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.post('/trips/createtrip', data);
            set((state) => ({ trips: [...state.trips, res.data] }));
        }
        catch (error) {
            toast.error("Failed to create trip");
            console.error("rcds")
        } finally {
            set({ isLoading: false });
        }

    },
    fetchTrips: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get('/trips/fetchtrip');
            set({ trips: res.data });
        } catch (error) {
            toast.error("Failed to fetch trips");
            console.error("Error fetching transactions:", error);
        } finally {
            set({ isLoading: false });
        }
    },
    fetchTripById: async (id) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get(`/trips/fetchtripbyid/${id}`);
            set({ trip: res.data });
        } catch (error) {
            toast.error("Failed to fetch trips");
            console.error("Error fetching transactions:", error);
        } finally {
            set({ isLoading: false });
        }
    },
    addExpenseToTrip: async (data) => {

        set({ isLoading: true });
        try {
            const res = await axiosInstance.post(`/trips/addexpense/${data.id}`, data);


        }
        catch (error) {
            toast.error("Failed to create trip");
            console.error("rcds")
        } finally {
            set({ isLoading: false });
        }

    },
    deleteTrip: async (id) => {
        set({ isLoading: true });
        try {
            await axiosInstance.delete(`/trips/deletetrip/${id}`);
            set((state) => ({
                trips: state.trips.filter((t) => t._id !== id)
            }));
        }
        catch (error) {
            toast.error("you can't delete this trip");
        } finally {
            set({ isLoading: false });
        }

    },
    deleteTran: async (id) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.delete(`/trips/deletetran/${id}`);
            const updatedTrip = res.data.trip;

            set((state) => ({
                trips: state.trips.map((trip) =>
                    trip._id === updatedTrip._id ? updatedTrip : trip
                )
                
            }));

            
          
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete expense");
            throw error;
        } finally {
            set({ isLoading: false });
        }
    }




})))