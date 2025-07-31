import React, { useState } from 'react';
import { axiosInstance } from '../lib/axios';
import { format } from 'date-fns';

function Find() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }
    if (!fromDate || !toDate) {
      setError('Please select both date ranges');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('fromDate', fromDate);
      formData.append('toDate', toDate);

      const res = await axiosInstance.post('/trips/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setTransactions(res.data.transactions);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process PDF. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  const totals = transactions.reduce((acc, transaction) => {
    if (transaction.type === 'CREDIT') {
      acc.credit += transaction.amount;
    } else if (transaction.type === 'DEBIT') {
      acc.debit += transaction.amount;
    }
    return acc;
  }, { credit: 0, debit: 0 });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 font-sans">
      {/* Header */}
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4 md:mb-6 text-center relative">
        Bank/UPI Statement Analyzer
        <span className="block w-16 md:w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-2"></span>
      </h2>
      
      {/* Upload Card */}
      <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg mb-6 md:mb-8">
        <div className="mb-4 md:mb-6">
          <label className="block text-gray-700 font-medium mb-1 md:mb-2 text-sm">Statement PDF</label>
          <div className="relative">
            <input 
              type="file" 
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full p-2 md:p-3 text-sm md:text-base border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 cursor-pointer file:mr-2 md:file:mr-4 file:py-1 md:file:py-2 file:px-2 md:file:px-4 file:rounded file:border-0 file:bg-gray-100 file:hover:bg-gray-200 file:text-xs md:file:text-sm"
            />
            {fileName && (
              <div className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 truncate">
                Selected: {fileName}
              </div>
            )}
          </div>
        </div>

        {/* Date Range */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-1 md:mb-2 text-sm">From Date</label>
            <input 
              type="date" 
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-1 md:mb-2 text-sm">To Date</label>
            <input 
              type="date" 
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 md:mb-6 text-sm md:text-base text-red-600 p-2 md:p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleUpload}
          disabled={isLoading}
          className={`w-full py-2 md:py-3 px-4 md:px-6 rounded-lg text-sm md:text-base text-white font-medium bg-gradient-to-r from-blue-500 to-blue-600 shadow-md hover:shadow-lg transition-all duration-300 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Statement...
            </span>
          ) : (
            'Analyze Statement'
          )}
        </button>
      </div>

      {/* Results Section */}
      {transactions.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4 md:p-6 rounded-xl shadow-lg mb-6 md:mb-8 flex flex-col sm:flex-row justify-between gap-3 md:gap-4">
            <div className="text-center flex-1 p-2 md:p-0">
              <strong className="block text-gray-300 text-xs md:text-sm font-medium mb-1">Total Credit</strong>
              <span className="text-xl md:text-2xl font-bold">
                ₹{totals.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-center flex-1 border-t sm:border-t-0 sm:border-l border-gray-600 pt-3 sm:pt-0 sm:pl-3 md:sm:pl-4 p-2 md:p-0">
              <strong className="block text-gray-300 text-xs md:text-sm font-medium mb-1">Total Debit</strong>
              <span className="text-xl md:text-2xl font-bold">
                ₹{totals.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-center flex-1 border-t sm:border-t-0 sm:border-l border-gray-600 pt-3 sm:pt-0 sm:pl-3 md:sm:pl-4 p-2 md:p-0">
              <strong className="block text-gray-300 text-xs md:text-sm font-medium mb-1">Net Balance</strong>
              <span className="text-xl md:text-2xl font-bold">
                ₹{(totals.credit - totals.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Transactions Table */}
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">Transaction Details</h3>
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-gray-50 font-semibold text-gray-600 p-3 md:p-4 border-b border-gray-200 text-xs md:text-sm">
              <div className="col-span-4 sm:col-span-3 md:col-span-2">Date</div>
              <div className="col-span-5 sm:col-span-6 md:col-span-7">Description</div>
              <div className="col-span-3 sm:col-span-2 md:col-span-2 text-right">Amount</div>
              <div className="hidden sm:block md:col-span-1 text-center">Type</div>
            </div>
            
            {/* Table Rows */}
            {transactions.map((transaction, index) => (
              <div 
                key={index} 
                className={`grid grid-cols-12 p-3 md:p-4 border-b border-gray-100 text-xs md:text-sm ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-blue-50 transition-colors`}
              >
                <div className="col-span-4 sm:col-span-3 md:col-span-2">
                  {format(new Date(transaction.date), 'dd MMM yy')}
                </div>
                <div className="col-span-5 sm:col-span-6 md:col-span-7 truncate">
                  {transaction.description}
                </div>
                <div className="col-span-3 sm:col-span-2 md:col-span-2 text-right font-medium">
                  ₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="hidden sm:block md:col-span-1 text-center font-semibold">
                  <span className={`text-xs md:text-sm ${
                    transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type.charAt(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Find;