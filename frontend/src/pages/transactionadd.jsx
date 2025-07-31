import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTransactionStore } from '../store/useTransactionStore';
import {Loader } from "lucide-react";
function TransactionAdd() {
  // Form state
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  // Filter state
  const [filterDates, setFilterDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'income', 'expense'
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  // Store hooks
  const { addTransaction, transactions, fetchTransactions, deleteTransaction } = useTransactionStore();
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced category options with icons
  const categoryOptions = {
    income: [
      { value: 'Salary', label: '💰 Salary' },
      { value: 'Freelance', label: '✍️ Freelance' },
      { value: 'Business Income', label: '🏢 Business Income' },
      { value: 'Investments', label: '📈 Investments' },
      { value: 'Gifts', label: '🎁 Gifts' },
      { value: 'Other Income', label: '➕ Other Income' },
    ],
    expense: [
      { value: 'Housing', label: '🏠 Housing' },
      { value: 'Utilities', label: '💡 Utilities' },
      { value: 'Groceries', label: '🛒 Groceries' },
      { value: 'Transportation', label: '🚗 Transportation' },
      { value: 'Healthcare', label: '🏥 Healthcare' },
      { value: 'Dining Out', label: '🍽️ Dining Out' },
      { value: 'Entertainment', label: '🎬 Entertainment' },
      { value: 'Shopping', label: '🛍️ Shopping' },
      { value: 'Others', label: '➕ Others' }
    ]
  };

  // Memoized filtered transactions
  const filteredTransactions = useMemo(() => {
    if (!isFilterApplied) return transactions;
    
    const startDate = new Date(filterDates.startDate);
    const endDate = new Date(filterDates.endDate);
    endDate.setHours(23, 59, 59, 999);

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [transactions, filterDates, isFilterApplied]);

  // Memoized display transactions with all filters applied
  const displayTransactions = useMemo(() => {
    let transactionsToDisplay = isFilterApplied ? filteredTransactions : transactions;

    // Apply tab filter
    if (activeTab !== 'all') {
      transactionsToDisplay = transactionsToDisplay.filter(
        t => t.type === activeTab
      );
    }

    // Sort by date (newest first) and limit to 50
    return [...transactionsToDisplay]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 50);
  }, [filteredTransactions, transactions, activeTab, isFilterApplied]);

  // Calculate totals based on display transactions
  const totals = useMemo(() => {
    return displayTransactions.reduce((acc, transaction) => {
      const amount = parseFloat(transaction.amount);
      if (transaction.type === 'income') {
        acc.income += amount;
        acc.total += amount;
      } else {
        acc.expense += amount;
        acc.total -= amount;
      }
      return acc;
    }, { income: 0, expense: 0, total: 0 });
  }, [displayTransactions]);

  // Load transactions on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchTransactions();
      } catch (error) {
        console.error("Error loading transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchTransactions]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFilterChange = (e) => {
    setFilterDates({
      ...filterDates,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addTransaction({
        ...formData,
        amount: parseFloat(formData.amount) || 0
      });
      setSubmitSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          type: formData.type, // Keep same type
          category: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          note: '',
        });
        setSubmitSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error adding transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyFilter = useCallback(() => {
    if (!filterDates.startDate || !filterDates.endDate) {
      setIsFilterApplied(false);
      return;
    }
    setIsFilterApplied(true);
  }, [filterDates]);

  const clearFilter = useCallback(() => {
    setFilterDates({ startDate: '', endDate: '' });
    setIsFilterApplied(false);
  }, []);

  const handleDelete = useCallback(async (id) => {
    
      try {
        setIsLoading(true);
        await deleteTransaction(id);
       
      } catch (error) {
        console.error("Error deleting transaction:", error);
      } finally {
        setIsLoading(false);
      }
  }, [deleteTransaction]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader className="animate-spin h-10 w-10 text-blue-600" />
          <p className="mt-4 text-gray-600">Loading your Transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Add transaction form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-8">
            <div className={`bg-gradient-to-r ${formData.type === 'income' ? 'from-green-400 to-emerald-500' : 'from-red-400 to-pink-500'} p-6 text-white`}>
              <h2 className="text-xl font-bold">Add New Transaction</h2>
              <p className="text-sm opacity-90 mt-1">Track your {formData.type === 'income' ? 'income' : 'expenses'}</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type Toggle */}
              <div className="flex justify-center">
                <div className="inline-flex bg-gray-100 rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                    className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${formData.type === 'income' ? 'bg-green-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                    className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${formData.type === 'expense' ? 'bg-red-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    Expense
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="relative">
                  <select
                    name="category"
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categoryOptions[formData.type].map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  max={new Date().toLocaleDateString('en-CA')}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Add a description..."
                  rows={2}
                  maxLength={100}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-all ${formData.type === 'income' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} shadow hover:shadow-md ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : submitSuccess ? (
                    <span className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Success!
                    </span>
                  ) : (
                    `Add ${formData.type === 'income' ? 'Income' : 'Expense'}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right column - Transactions list with filter */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Income</p>
                  <p className="text-xl font-bold text-green-600">
                    ₹{totals.income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Expenses</p>
                  <p className="text-xl font-bold text-red-600">
                    ₹{totals.expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Net Balance</p>
                  <p className={`text-xl font-bold ${totals.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totals.total >= 0 ? '+' : '-'}₹{Math.abs(totals.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${totals.total >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filter section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
              
              <div className="flex flex-col md:flex-row gap-4">
                {/* Date Filters */}
                <div className="flex gap-2">
                  <input
                    type="date"
                    name="startDate"
                    value={filterDates.startDate}
                    onChange={handleFilterChange}
                    max={new Date().toLocaleDateString('en-CA')}
                    className="border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <span className="flex items-center">to</span>
                  <input
                    type="date"
                    name="endDate"
                    value={filterDates.endDate}
                    onChange={handleFilterChange}
                    max={new Date().toLocaleDateString('en-CA')}
                    className="border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <button
                    onClick={applyFilter}
                    disabled={!filterDates.startDate || !filterDates.endDate}
                    className={`bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg font-medium transition-all shadow hover:shadow-md ${!filterDates.startDate || !filterDates.endDate ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Apply
                  </button>
                </div>
                
                {/* Clear Filter */}
                {isFilterApplied && (
                  <button
                    onClick={clearFilter}
                    className="text-sm text-blue-500 hover:text-blue-700 whitespace-nowrap"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
            
            {/* Transaction Type Tabs */}
            <div className="mt-4 flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                All Transactions
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'income' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Income
              </button>
              <button
                onClick={() => setActiveTab('expense')}
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'expense' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Expenses
              </button>
            </div>
          </div>

          {/* Transactions list */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {displayTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No transactions found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isFilterApplied ? 'No transactions match your filters.' : 'Get started by adding a new transaction.'}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {displayTransactions.map((transaction) => (
                  <li key={transaction._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 min-w-0">
                        <div className={`p-3 rounded-full ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {transaction.type === 'income' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{transaction.category}</p>
                          <div className="flex items-center text-sm text-gray-500 space-x-2">
                            <span>
                              {new Date(transaction.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            {transaction.note && (
                              <>
                                <span>•</span>
                                <span className="truncate">{transaction.note}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}₹{parseFloat(transaction.amount).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </p>
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                          disabled={isLoading}
                          title="Delete transaction"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionAdd;