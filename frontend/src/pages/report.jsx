import { useState } from 'react';
import { useTransactionStore } from "../store/useTransactionStore";
import { useEffect, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MonthlySummary = () => {
  const { transactions, fetchTransactions, allBudgets, getAllBudget } = useTransactionStore();
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [selectedView, setSelectedView] = useState('summary');
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
      const loadData = async () => {
        setIsLoading(true);
        try {
          await Promise.all([fetchTransactions(), getAllBudget()]);
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }, [fetchTransactions, getAllBudget]);


  const { monthlyData, sortedMonths, totals, categoryBreakdown } = useMemo(() => {
    const transactionData = transactions.reduce((acc, t) => {
      const date = new Date(t.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = { 
          income: 0, 
          expense: 0,
          month: date.getMonth(),
          year: date.getFullYear(),
          categories: {}
        };
      }
      
      if (t.type === 'income') {
        acc[monthYear].income += parseFloat(t.amount);
      } else {
        acc[monthYear].expense += parseFloat(t.amount);
        if (t.category) {
          acc[monthYear].categories[t.category] = 
            (acc[monthYear].categories[t.category] || 0) + parseFloat(t.amount);
        }
      }
      
      return acc;
    }, {});

    const budgetData = allBudgets.reduce((acc, budget) => {
      const date = new Date(budget.createdAt);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = { 
          budget: 0,
          month: date.getMonth(),
          year: date.getFullYear(),
          budgetCategories: {}
        };
      }
      
      acc[monthYear].budget += parseFloat(budget.amount);
      if (budget.category) {
        acc[monthYear].budgetCategories[budget.category] = 
          (acc[monthYear].budgetCategories[budget.category] || 0) + parseFloat(budget.amount);
      }
      return acc;
    }, {});

    const mergedData = Object.keys({ ...transactionData, ...budgetData }).reduce((acc, monthYear) => {
      acc[monthYear] = {
        ...(transactionData[monthYear] || { 
          income: 0, 
          expense: 0, 
          month: 0, 
          year: 0,
          categories: {} 
        }),
        budget: (budgetData[monthYear]?.budget || 0),
        month: budgetData[monthYear]?.month || transactionData[monthYear]?.month,
        year: budgetData[monthYear]?.year || transactionData[monthYear]?.year,
        budgetCategories: budgetData[monthYear]?.budgetCategories || {}
      };
      return acc;
    }, {});

    const sorted = Object.entries(mergedData).sort((a, b) => {
      if (a[1].year !== b[1].year) return a[1].year - b[1].year;
      return a[1].month - b[1].month;
    });

    const totals = {
      income: sorted.reduce((sum, [_, data]) => sum + data.income, 0),
      expense: sorted.reduce((sum, [_, data]) => sum + data.expense, 0),
      budget: sorted.reduce((sum, [_, data]) => sum + data.budget, 0),
    };

    const categoryBreakdown = {};
    sorted.forEach(([monthYear, data]) => {
      const allCategories = new Set([
        ...Object.keys(data.categories),
        ...Object.keys(data.budgetCategories)
      ]);
      
      categoryBreakdown[monthYear] = Array.from(allCategories).map(category => ({
        category,
        budget: data.budgetCategories[category] || 0,
        expense: data.categories[category] || 0,
        difference: (data.budgetCategories[category] || 0) - (data.categories[category] || 0)
      })).sort((a, b) => b.budget - a.budget);
    });

    return {
      monthlyData: mergedData,
      sortedMonths: sorted,
      totals,
      categoryBreakdown
    };
  }, [transactions, allBudgets]);

  const chartData = {
    labels: sortedMonths.map(([month]) => month),
    datasets: [
      {
        label: 'Income',
        data: sortedMonths.map(([_, data]) => data.income),
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
      {
        label: 'Expenses',
        data: sortedMonths.map(([_, data]) => data.expense),
        backgroundColor: '#ef4444',
        borderRadius: 4,
      },
      {
        label: 'Budget',
        data: sortedMonths.map(([_, data]) => data.budget),
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
              minimumFractionDigits: 2,
            });
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value.toLocaleString('en-IN')}`,
        },
      },
    },
  };

  const toggleMonthExpand = (monthYear) => {
    if (expandedMonth === monthYear) {
      setExpandedMonth(null);
    } else {
      setExpandedMonth(monthYear);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-gray-800">Monthly Financial Summary</h3>
        
        <div className="flex flex-wrap gap-4">
          <div className="bg-green-50 p-3 rounded-lg min-w-[120px]">
            <p className="text-sm text-green-600">Total Income</p>
            <p className="text-lg font-semibold text-green-700">
              {formatCurrency(totals.income)}
            </p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg min-w-[120px]">
            <p className="text-sm text-red-600">Total Expenses</p>
            <p className="text-lg font-semibold text-red-700">
              {formatCurrency(totals.expense)}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg min-w-[120px]">
            <p className="text-sm text-blue-600">Total Budget</p>
            <p className="text-lg font-semibold text-blue-700">
              {formatCurrency(totals.budget)}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 h-80">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700">Monthly Breakdown</h4>
        
        {sortedMonths.map(([monthYear, data]) => {
          const budgetDiff = data.budget - data.expense;
          const budgetPercentage = data.budget > 0 
            ? Math.min((data.expense / data.budget) * 100, 100)
            : 0;

          return (
            <div key={monthYear} className="border rounded-lg overflow-hidden">
              <div 
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between items-center"
                onClick={() => toggleMonthExpand(monthYear)}
              >
                <div className="flex items-center gap-3">
                  <h5 className="font-medium text-gray-800">{monthYear}</h5>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    budgetDiff >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {budgetDiff >= 0 ? 'Under' : 'Over'} Budget: {formatCurrency(Math.abs(budgetDiff))}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {budgetPercentage.toFixed(1)}% of budget used
                  </span>
                  <span>{expandedMonth === monthYear ? '▲' : '▼'}</span>
                </div>
              </div>
              
              {expandedMonth === monthYear && (
                <div className="border-t p-4 bg-gray-50">
                  <div className="flex justify-between mb-4">
                    <div className="flex gap-2">
                      <button
                        className={`px-3 py-1 rounded-md text-sm ${selectedView === 'summary' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                        onClick={() => setSelectedView('summary')}
                      >
                        Summary
                      </button>
                      <button
                        className={`px-3 py-1 rounded-md text-sm ${selectedView === 'category' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                        onClick={() => setSelectedView('category')}
                      >
                        Categories
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Net</p>
                      <p className={`text-sm font-medium ${
                        data.income - data.expense >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(data.income - data.expense)}
                      </p>
                    </div>
                  </div>
                  
                  {selectedView === 'summary' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-500">Income</span>
                          <span className="text-sm font-medium text-green-600">
                            {formatCurrency(data.income)}
                          </span>
                        </div>
                        <div className="w-full bg-green-100 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-500">Budget</span>
                          <span className="text-sm font-medium text-blue-600">
                            {formatCurrency(data.budget)}
                          </span>
                        </div>
                        <div className="w-full bg-blue-100 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-500">Expenses</span>
                          <span className="text-sm font-medium text-red-600">
                            {formatCurrency(data.expense)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ 
                              width: `${data.budget > 0 
                                ? Math.min((data.expense / data.budget) * 100, 100) 
                                : 0}%` 
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {budgetPercentage.toFixed(1)}% of budget
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {categoryBreakdown[monthYear].length > 0 ? (
                        categoryBreakdown[monthYear].map(({ category, budget, expense, difference }) => (
                          <div key={category} className="bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium text-gray-700">{category}</span>
                              <span className={`text-sm ${
                                difference >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {difference >= 0 ? 'Under' : 'Over'}: {formatCurrency(Math.abs(difference))}
                              </span>
                            </div>
                            
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Budget: {formatCurrency(budget)}</span>
                              <span>Expense: {formatCurrency(expense)}</span>
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-red-500 h-2 rounded-full" 
                                style={{ 
                                  width: `${budget > 0 
                                    ? Math.min((expense / budget) * 100, 100) 
                                    : 0}%` 
                                }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No category data available for this month
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlySummary;