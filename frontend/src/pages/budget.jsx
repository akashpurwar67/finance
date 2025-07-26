import { useState, useEffect, useMemo, useCallback } from "react";
import { useTransactionStore } from "../store/useTransactionStore";
import { Plus, MoreVertical, Trash2, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BudgetPage = () => {
  const {
    addBudget,
    fetchTransactions,
    transactions,
    budgets,
    getBudget,
    deleteTransaction,
    deleteBudget
  } = useTransactionStore();

  const [activeTab, setActiveTab] = useState("categories");
  const [timeRange, setTimeRange] = useState("monthly");
  const [newBudget, setNewBudget] = useState({
    category: "",
    amount: "",
    period: "monthly"
  });
  const navigate = useNavigate();
  const [categorySpent, setCategorySpent] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  // Category options with icons
  const categoryOptions = [
    { value: "Housing", label: "🏠 Housing" },
    { value: "Utilities", label: "💡 Utilities" },
    { value: "Groceries", label: "🛒 Groceries" },
    { value: "Transportation", label: "🚗 Transportation" },
    { value: "Dining Out", label: "🍽️ Dining Out" },
    { value: "Entertainment", label: "🎬 Entertainment" },
    { value: "Shopping", label: "🛍️ Shopping" },
    { value: "Travel", label: "✈️ Travel" },
    { value: "Others", label: "➕ Others" }
  ];

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchTransactions(), getBudget()]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchTransactions, getBudget]);

  // Calculate filtered transactions
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate &&
        transactionDate <= endDate &&
        transaction.type === 'expense';
    });
  }, [transactions]);

  // Calculate category spending
  useEffect(() => {
    if (filteredTransactions.length > 0) {
      const spent = {};
      filteredTransactions.forEach(tx => {
        if (!spent[tx.category]) {
          spent[tx.category] = 0;
        }
        spent[tx.category] += parseFloat(tx.amount || 0);
      });
      setCategorySpent(spent);
    } else {
      setCategorySpent({});
    }
  }, [filteredTransactions]);

  const handleAddBudget = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await addBudget({
        ...newBudget,
        amount: parseFloat(newBudget.amount) || 0
      });
      await getBudget();
      setNewBudget({ category: "", amount: "", period: "monthly" });
    } catch (error) {
      console.error("Error adding budget:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = useCallback(async (id) => {
    try {
      setIsLoading(true);
      await deleteTransaction(id);
      await fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
      setIsLoading(false);
    }
  }, [deleteTransaction, fetchTransactions]);

  const handleBudgetDelete = useCallback(async (id) => {
    try {
      setIsLoading(true);
      await deleteBudget(id);
      await getBudget();
    } catch (error) {
      console.error("Error deleting budget:", error);
    } finally {
      setIsLoading(false);
    }
  }, [deleteBudget, getBudget]);

  const totalBudgeted = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount || 0), 0);
  const totalSpent = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const remainingBudget = totalBudgeted - totalSpent;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader className="animate-spin h-10 w-10 text-blue-600" />
          <p className="mt-4 text-gray-600">Loading your budget data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Budget Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} overview of your finances
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center shadow-md hover:shadow-lg"
            onClick={() => {navigate('/add')}}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-between items-center mb-8">
        <div className="inline-flex rounded-md shadow-sm bg-gray-100 p-1">
          {["monthly"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                timeRange === range
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Total Budget</h3>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalBudgeted)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-2">for {timeRange} expenses</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Total Spent</h3>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            {totalBudgeted > 0 ? ((totalSpent / totalBudgeted) * 100).toFixed(1) : 0}% of budget
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Remaining</h3>
              <p className={`text-2xl font-bold ${
                remainingBudget >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {formatCurrency(Math.abs(remainingBudget))} {remainingBudget >= 0 ? "left" : "over"}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              remainingBudget >= 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}>
              {remainingBudget >= 0 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-2">for this {timeRange}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {["categories", "transactions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Budget Categories</h2>
                <span className="text-sm text-gray-500">
                  {budgets.length} {budgets.length === 1 ? 'category' : 'categories'}
                </span>
              </div>

              <form onSubmit={handleAddBudget} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                    required
                  >
                    <option value="">Select a category</option>
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="0.00"
                    value={newBudget.amount}
                    onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                    value={newBudget.period}
                    onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value })}
                  >
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                    ) : (
                      <Plus className="h-5 w-5 mr-2" />
                    )}
                    Add Budget
                  </button>
                </div>
              </form>

              {budgets.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No budget categories</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Get started by adding a budget category above.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Budgeted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Spent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remaining
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {budgets.map((budget) => {
                        const spent = parseFloat(categorySpent[budget.category] || 0);
                        const remaining = parseFloat(budget.amount || 0) - spent;
                        const progress = (budget.amount > 0 ? (spent / parseFloat(budget.amount)) * 100 : 0);

                        return (
                          <tr key={budget._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {budget.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(parseFloat(budget.amount || 0))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(spent)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <span className={remaining >= 0 ? "text-green-600" : "text-red-600"}>
                                {formatCurrency(Math.abs(remaining))} {remaining >= 0 ? "left" : "over"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className={`h-2.5 rounded-full ${
                                      progress > 100 ? "bg-red-500" : 
                                      progress > 80 ? "bg-yellow-500" : "bg-green-500"
                                    }`}
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500 w-10 text-right">
                                  {progress.toFixed(0)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleBudgetDelete(budget._id)}
                                className="text-red-600 hover:text-red-800 flex items-center"
                                disabled={isLoading}
                                title="Delete budget"
                              >
                                {isLoading ? (
                                  <Loader className="animate-spin h-4 w-4" />
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
              <span className="text-sm text-gray-500">
                {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'} this month
              </span>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No transactions this month</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Add your first expense transaction to see it here.
                </p>
                <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition inline-flex items-center"
                  onClick={() => {
                    // You might want to redirect to add transaction page
                    console.log('Add transaction clicked');
                  }}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Transaction
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {transaction.note || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className="text-red-600">
                            -{formatCurrency(Math.abs(parseFloat(transaction.amount || 0)))}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDelete(transaction._id)}
                            className="text-red-600 hover:text-red-800 flex items-center"
                            disabled={isLoading}
                            title="Delete transaction"
                          >
                            {isLoading ? (
                              <Loader className="animate-spin h-4 w-4" />
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetPage;