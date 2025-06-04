import { useState, useEffect, useMemo, useCallback } from "react";
import { useTransactionStore } from "../store/useTransactionStore";
import { Plus, MoreVertical } from "lucide-react";

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
  const [categorySpent, setCategorySpent] = useState({});
  const [isLoading, setIsLoading] = useState(true);

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
      console.error("Error deleting transaction:", error);
    } finally {
      setIsLoading(false);
    }
  }, [deleteTransaction, fetchTransactions]);

  const totalBudgeted = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount || 0), 0);
  const totalSpent = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const remainingBudget = totalBudgeted - totalSpent;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Budget Dashboard</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-end mb-6">
        <div className="inline-flex rounded-md shadow-sm">
          {["monthly"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium ₹{
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              } ₹{range === "weekly" ? "rounded-l-lg" : ""} ₹{
                range === "yearly" ? "rounded-r-lg" : ""
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Total Budget</h3>
          <p className="text-2xl font-bold text-gray-800">₹{totalBudgeted.toFixed(2)}</p>
          <p className="text-gray-500 text-sm">for {timeRange} expenses</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Total Spent</h3>
          <p className="text-2xl font-bold text-gray-800">₹{totalSpent.toFixed(2)}</p>
          <p className="text-gray-500 text-sm">
            {totalBudgeted > 0 ? ((totalSpent / totalBudgeted) * 100).toFixed(1) : 0}% of budget
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Remaining</h3>
          <p className={`text-2xl font-bold ₹{
            remainingBudget >= 0 ? "text-green-600" : "text-red-600"
          }`}>
            ₹{Math.abs(remainingBudget).toFixed(2)} {remainingBudget >= 0 ? "left" : "over"}
          </p>
          <p className="text-gray-500 text-sm">for this {timeRange}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {["categories", "transactions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-4 px-1 font-medium text-sm ${
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
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Budget Categories</h2>
              <form onSubmit={handleAddBudget} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                    required
                  >
                    <option value="">Select a category</option>
                    
                      <option value="Housing">🏠 Housing</option>
                      <option value="Utilities">💡 Utilities</option>
                      <option value="Groceries">🛒 Groceries</option>
                      <option value="Transportation">🚗 Transportation</option>
                      <option value="Dining Out">🍽️ Dining Out</option>
                      <option value="Entertainment">🎬 Entertainment</option>
                      <option value="Shopping">🛍️ Shopping</option>
                      <option value="Travel">✈️ Travel</option>
                      <option value="Others">➕Others</option>
                    
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newBudget.period}
                    onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value })}
                  >
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    disabled={isLoading}
                  >
                    {isLoading ? "Adding..." : "Add Budget"}
                  </button>
                </div>
              </form>

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
                        <tr key={budget._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {budget.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{parseFloat(budget.amount || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{spent.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span className={remaining >= 0 ? "text-green-600" : "text-red-600"}>
                              ₹{Math.abs(remaining).toFixed(2)} {remaining >= 0 ? "left" : "over"}
                            </span>
                          </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${progress > 100 ? "bg-red-500" : progress > 80 ? "bg-yellow-500" : "bg-green-500"}`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-gray-400 hover:text-gray-600">
                              <button
                                onClick={() => handleBudgetDelete(budget._id)}
                                className="text-red-600 hover:text-red-800"
                                disabled={isLoading}
                              >
                                {isLoading ? "Deleting..." : "Delete"}
                              </button>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h2>
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
                    <tr key={transaction._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {transaction.note}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.amount < 0 ? "text-red-600" : "text-green-600"}>
                          ₹{Math.abs(parseFloat(transaction.amount || 0)).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={isLoading}
                        >
                          {isLoading ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetPage;