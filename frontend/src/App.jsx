import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import TransactionAdd from './pages/transactionadd';
import BudgetPage from './pages/budget';
import Home from './pages/home';
import { Toaster } from "react-hot-toast";
import Login from './pages/login';
import SignUp from './pages/signup';
import NavBar from './component/navbar';
import MonthlySummary from './pages/report';
import TripListPage from './pages/trip';
import TripDetailPage from './pages/tripdetails';
import Find from './pages/find';

function App() {
  const { authUser, checkAuth } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setIsCheckingAuth(false);
    };
    verifyAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Router>
        <NavBar />
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={!authUser ? <Login /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/signup" 
              element={!authUser ? <SignUp /> : <Navigate to="/" replace />} 
            />
            
            <Route 
              path="/add" 
              element={authUser ? <TransactionAdd /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/budget" 
              element={authUser ? <BudgetPage /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/report" 
              element={authUser ? <MonthlySummary /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/trip" 
              element={authUser ? <TripListPage /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/trips/:id" 
              element={authUser ? <TripDetailPage /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/find" 
              element={authUser ? <Find /> : <Navigate to="/login" replace />} 
            />
          </Routes>
          <Toaster/>

        </div>
      </Router>
    </div>
  );
}

export default App;