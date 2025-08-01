import { useState, useEffect, useMemo } from 'react';
import { useTransactionStore } from "../store/useTransactionStore";
import { Bar } from "react-chartjs-2";
import { Loader } from "lucide-react";
import { useNavigate } from 'react-router-dom';
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
  const [timeRange, setTimeRange] = useState('last-3-months');
  const navigate = useNavigate();

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

  const getDateRange = () => {
    const now = new Date();
    const startDate = new Date(now);
    const endDate = new Date(now);
    
    

    endDate.setMonth(now.getMonth() + 1);
    endDate.setDate(0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0,0,0,0);
    

    switch (timeRange) {
      case 'current-month':
        startDate.setMonth(now.getMonth());
        startDate.setDate(1);
      
        break;
      case 'last-3-months':
        startDate.setMonth(now.getMonth() - 2);
        startDate.setDate(1);
      
        break;
      case 'last-6-months':
        startDate.setMonth(now.getMonth() - 5);
        startDate.setDate(1);
     
        break;
      case 'last-9-months':
        startDate.setMonth(now.getMonth() - 8);
        startDate.setDate(1);
        
        break;
      case 'last-12-months':
        startDate.setMonth(now.getMonth() - 11);
        startDate.setDate(1);
        
        break;
      
      default:
        startDate.setDate(1);
        
        break;
    }

    return { startDate, endDate };
  };

  const { monthlyData, sortedMonths, totals, categoryBreakdown, hasData } = useMemo(() => {
    const { startDate, endDate } = getDateRange();

    const filteredTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= startDate && date <= endDate;
    });

    const filteredBudgets = allBudgets.filter(b => {
      const date = new Date(b.createdAt);
      return date >= startDate && date <= endDate;
    });

    // Generate all months in the selected range to ensure we show empty months
    const allMonths = [];
    const current = new Date(startDate);
    let x = new Date(startDate);
    x.setDate(1);
    x = x.toISOString().split('T')[0];
    
    current.setDate(1); // Ensure we start from the first day of the month

    while (current <= endDate) {
      const monthYear = `${current.toLocaleString('default', { month: 'short' })} ${current.getFullYear()}`;
      allMonths.push({
        key: monthYear,
        month: current.getMonth(),
        year: current.getFullYear()
      });
      current.setMonth(current.getMonth() + 1);
    }

    const transactionData = filteredTransactions.reduce((acc, t) => {
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

    const budgetData = filteredBudgets.reduce((acc, budget) => {
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

    // Merge with all months to ensure we have entries for every month in range
    const mergedData = allMonths.reduce((acc, { key, month, year }) => {
      acc[key] = {
        ...(transactionData[key] || {
          income: 0,
          expense: 0,
          categories: {}
        }),
        budget: (budgetData[key]?.budget || 0),
        month,
        year,
        budgetCategories: budgetData[key]?.budgetCategories || {}
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

    // Check if we have any actual data (not just empty months)
    const hasActualData = sorted.some(([_, data]) =>
      data.income > 0 || data.expense > 0 || data.budget > 0
    );

    return {
      monthlyData: mergedData,
      sortedMonths: sorted,
      totals,
      categoryBreakdown,
      hasData: hasActualData
    };
  }, [transactions, allBudgets, timeRange]);

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
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader className="animate-spin h-10 w-10 text-blue-600" />
          <p className="mt-4 text-gray-600">Loading your Reports...</p>
        </div>
      </div>
    );
  }

  // Show empty state if there are no transactions AND no budgets at all
  if (transactions.length === 0 && allBudgets.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md text-center">
        <div className="max-w-md mx-auto py-12">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
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
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No financial data available
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by adding transactions or budgets to see your monthly summary.
          </p>
          <div className="mt-6 flex gap-4 justify-center">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => navigate('/add')}
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Transaction
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={() => navigate('/budgets')}
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Budget
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-gray-800">Financial Summary</h3>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="current-month">Current Month</option>
              <option value="last-3-months">Last 3 Months</option>
              <option value="last-6-months">Last 6 Months</option>
              <option value="last-9-months">Last 9 Months</option>
              <option value="last-12-months">Last 12 Months</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
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
      </div>

      {hasData ? (
        <>
          <div className="mb-8 h-80">
            <Bar data={chartData} options={chartOptions} />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-700">Monthly Breakdown</h4>
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
            </div>

            {sortedMonths.map(([monthYear, data]) => {
              const budgetDiff = data.budget - data.expense;
              const budgetPercentage = data.budget > 0
                ? Math.min((data.expense / data.budget) * 100, 100)
                : 0;

              // Skip months with no data if they're completely empty
              if (data.income === 0 && data.expense === 0 && data.budget === 0) {
                return null;
              }

              return (
                <div key={monthYear} className="border rounded-lg overflow-hidden">
                  <div
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between items-center"
                    onClick={() => toggleMonthExpand(monthYear)}
                  >
                    <div className="flex items-center gap-3">
                      <h5 className="font-medium text-gray-800">{monthYear}</h5>
                      {data.budget > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${budgetDiff >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {budgetDiff >= 0 ? 'Under' : 'Over'} Budget: {formatCurrency(Math.abs(budgetDiff))}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {data.budget > 0 && (
                        <span className="text-sm text-gray-500">
                          {budgetPercentage.toFixed(1)}% of budget used
                        </span>
                      )}
                      <span>{expandedMonth === monthYear ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {expandedMonth === monthYear && (
                    <div className="border-t p-4 bg-gray-50">
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

                          {data.budget > 0 && (
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
                          )}

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
                                    : 100}%`
                                }}
                              />
                            </div>
                            {data.budget > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                {budgetPercentage.toFixed(1)}% of budget
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {categoryBreakdown[monthYear].length > 0 ? (
                            categoryBreakdown[monthYear].map(({ category, budget, expense, difference }) => (
                              <div key={category} className="bg-white p-3 rounded-lg shadow-sm">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium text-gray-700">{category}</span>
                                  {budget > 0 && (
                                    <span className={`text-sm ${difference >= 0 ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                      {difference >= 0 ? 'Under' : 'Over'}: {formatCurrency(Math.abs(difference))}
                                    </span>
                                  )}
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
        </>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
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
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No data available for selected time range
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Try selecting a different time range or add more transactions/budgets.
          </p>
          <div className="mt-6 flex gap-4 justify-center">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => navigate('/add')}
            >
              Add Transaction
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={() => navigate('/budget')}
            >
              Add Budget
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlySummary;