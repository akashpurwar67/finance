import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTripStore } from '../store/useTripStore';
import { toast } from 'react-hot-toast';
import { Plus, MoreVertical, Trash2, Loader } from "lucide-react";
const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trip, fetchTripById, isLoading, addExpenseToTrip } = useTripStore();
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: '',
  });
  const [settlements, setSettlements] = useState([]);
  const [participantBalances, setParticipantBalances] = useState({});
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [perPersonCost, setPerPersonCost] = useState(0);

  useEffect(() => {
    fetchTripById(id);
  }, [id]);

  useEffect(() => {
    if (trip && trip.participants && trip.expenses) {
      calculateBalances();
    }
  }, [trip]);

  const calculateBalances = () => {
    // Calculate total expenses
    const total = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalExpenses(total);
    setPerPersonCost(total / trip.participants.length);

    // Calculate individual balances
    const balances = {};
    trip.participants.forEach(participant => {
      balances[participant] = 0;
    });

    trip.expenses.forEach(expense => {
      // The payer gets credited with the full amount
      balances[expense.paidBy] += expense.amount;
      
      // Each participant owes their share
      const share = expense.amount / trip.participants.length;
      trip.participants.forEach(participant => {
        balances[participant] -= share;
      });
    });

    // Round balances to 2 decimal places
    Object.keys(balances).forEach(key => {
      balances[key] = parseFloat(balances[key].toFixed(2));
    });

    setParticipantBalances(balances);
  };

  const addExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !newExpense.paidBy) {
      toast.error('Please fill all fields');
      return;
    }
    
    try {
      await addExpenseToTrip({
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        id
      });
      await fetchTripById(id);
      setNewExpense({ description: '', amount: '', paidBy: '' });
      toast.success('Expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    }
  };

  const calculateSettlements = () => {
    if (!trip || !trip.expenses || trip.expenses.length === 0) {
      toast.error('No expenses to calculate');
      setSettlements([]);
      return;
    }

    // Create copies of creditor and debtor arrays from participantBalances
    const creditors = [];
    const debtors = [];
    
    Object.entries(participantBalances).forEach(([person, balance]) => {
      if (balance > 0) {
        creditors.push({ person, amount: balance });
      } else if (balance < 0) {
        debtors.push({ person, amount: -balance }); // Store as positive number
      }
    });

    // Sort by amount (highest first)
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    // Calculate settlements
    const newSettlements = [];
    let creditorIndex = 0;
    let debtorIndex = 0;

    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
      const creditor = creditors[creditorIndex];
      const debtor = debtors[debtorIndex];
      
      const settlementAmount = parseFloat(Math.min(creditor.amount, debtor.amount).toFixed(2));
      
      newSettlements.push({
        from: debtor.person,
        to: creditor.person,
        amount: settlementAmount
      });

      // Update remaining amounts
      creditor.amount -= settlementAmount;
      debtor.amount -= settlementAmount;

      // Move to next creditor/debtor if current one is settled
      if (creditor.amount <= 0.01) creditorIndex++;
      if (debtor.amount <= 0.01) debtorIndex++;
    }

    setSettlements(newSettlements);
    toast.success('Settlements calculated');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );
  }
  if (!trip) return <div className="text-center py-8">Trip not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button 
        onClick={() => navigate('/trip')}
        className="mb-4 text-blue-500 hover:underline flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to all trips
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{trip.name}</h1>
        <span className="text-sm text-gray-500">
          Created: {new Date(trip.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Participants */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-3">Participants</h2>
        <div className="flex flex-wrap gap-2">
          {trip.participants.map((participant, index) => (
            <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
              {participant}
            </span>
          ))}
        </div>
      </div>

      {/* Cost Summary */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-3">Cost Summary</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="font-bold text-lg">₹{totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Per Person Cost</p>
            <p className="font-bold text-lg">₹{perPersonCost.toFixed(2)}</p>
          </div>
        </div>

        <h3 className="font-medium mb-2">Current Balances</h3>
        <div className="space-y-2">
          {trip.participants.map((participant) => (
            <div key={participant} className="flex justify-between items-center">
              <span className="font-medium">{participant}</span>
              <span className={`font-medium ${
                participantBalances[participant] > 0 
                  ? 'text-green-600' 
                  : participantBalances[participant] < 0 
                    ? 'text-red-600' 
                    : 'text-gray-600'
              }`}>
                {participantBalances[participant] > 0 
                  ? `Gets back ₹${participantBalances[participant].toFixed(2)}`
                  : participantBalances[participant] < 0
                    ? `Owes ₹${Math.abs(participantBalances[participant]).toFixed(2)}`
                    : 'Settled up'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Expense Form */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-3">Add New Expense</h2>
        <form onSubmit={addExpense} className="space-y-3">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              id="description"
              placeholder="Dinner, Taxi, etc."
              value={newExpense.description}
              onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              id="amount"
              placeholder="0.00"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 mb-1">
              Paid by
            </label>
            <select
              id="paidBy"
              value={newExpense.paidBy}
              onChange={(e) => setNewExpense({...newExpense, paidBy: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select who paid</option>
              {trip.participants.map((participant, index) => (
                <option key={index} value={participant}>{participant}</option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Add Expense
          </button>
        </form>
      </div>

      {/* Expenses List */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Expenses</h2>
          <span className="text-sm text-gray-500">
            {trip.expenses.length} {trip.expenses.length === 1 ? 'expense' : 'expenses'}
          </span>
        </div>
        
        {trip.expenses.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No expenses added yet</p>
        ) : (
          <div className="space-y-3">
            {trip.expenses.map((expense, index) => (
              <div key={index} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-gray-500">
                      Paid by {expense.paidBy} • {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-bold">₹{expense.amount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settlements */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Settlements</h2>
          <button
            onClick={calculateSettlements}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            disabled={trip.expenses.length === 0}
          >
            Calculate Split
          </button>
        </div>

        {settlements.length === 0 ? (
          <p className="text-center py-4 text-gray-500">
            {trip.expenses.length > 0 
              ? "Click 'Calculate Split' to see who owes whom" 
              : "Add expenses to calculate settlements"}
          </p>
        ) : (
          <div className="space-y-3">
            {settlements.map((settlement, index) => (
              <div key={index} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {settlement.from} → {settlement.to}
                    </p>
                    <p className="text-sm text-gray-500">
                      Payment needed to balance expenses
                    </p>
                  </div>
                  <p className="font-bold text-red-600">₹{settlement.amount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripDetailPage;