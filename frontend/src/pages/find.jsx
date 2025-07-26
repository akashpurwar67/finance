import React, { useState } from 'react';
import { axiosInstance } from '../lib/axios';
import { format } from 'date-fns';
import styled, { keyframes } from 'styled-components';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(52, 152, 219, 0); }
  100% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0); }
`;

// Styled Components
const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.h2`
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-weight: 600;
  text-align: center;
  position: relative;
  
  &::after {
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background: linear-gradient(to right, #3498db, #9b59b6);
    margin: 0.5rem auto 0;
    border-radius: 2px;
  }
`;

const UploadCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #34495e;
  font-size: 0.95rem;
`;

const FileInput = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 2px dashed #bdc3c7;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #3498db;
    background: #f0f7ff;
  }
  
  &::file-selector-button {
    padding: 0.5rem 1rem;
    background: #ecf0f1;
    border: none;
    border-radius: 4px;
    margin-right: 1rem;
    cursor: pointer;
    transition: background 0.2s;
    
    &:hover {
      background: #dfe6e9;
    }
  }
`;

const DateInput = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  font-family: inherit;
  transition: border 0.3s;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const DateRangeContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin-bottom: 1rem;
  padding: 0.8rem;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 8px;
  border-left: 4px solid #e74c3c;
  animation: ${fadeIn} 0.3s ease-out;
`;

const SubmitButton = styled.button`
  background: linear-gradient(to right, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(52, 152, 219, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(52, 152, 219, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background: #bdc3c7;
  }
  
  ${({ isLoading }) => isLoading && `
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      animation: shimmer 1.5s infinite;
    }
  `}
`;

const SummaryCard = styled.div`
  background: linear-gradient(135deg, #2c3e50, #4a6491);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease-out;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const SummaryItem = styled.div`
  text-align: center;
  flex: 1;
  
  strong {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.9rem;
    opacity: 0.8;
  }
  
  span {
    font-size: 1.3rem;
    font-weight: 600;
  }
  
  &:not(:last-child) {
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    
    @media (max-width: 600px) {
      border-right: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 1rem;
    }
  }
`;

const TransactionTable = styled.div`
  border: 1px solid #e0e6ed;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  animation: ${fadeIn} 0.5s ease-out;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 3fr 1fr 1fr;
  background: #f8f9fa;
  font-weight: 600;
  color: #7f8c8d;
  padding: 1rem;
  border-bottom: 1px solid #e0e6ed;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 2fr 1fr;
    div:nth-child(3) {
      display: none;
    }
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 3fr 1fr 1fr;
  padding: 1rem;
  border-bottom: 1px solid #f1f3f5;
  background: ${({ index }) => (index % 2 === 0 ? '#fff' : '#f8fafc')};
  transition: background 0.2s;
  
  &:hover {
    background: #f1f8ff;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 2fr 1fr;
    div:nth-child(3) {
      display: none;
    }
  }
`;

const AmountCell = styled.div`
  text-align: right;
  font-weight: 500;
`;

const TypeCell = styled.div`
  text-align: center;
  font-weight: 600;
  color: ${({ type }) => (type === 'CREDIT' ? '#27ae60' : '#e74c3c')};
`;

function Find() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
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
    <Container>
      <Header>Bank/UPI Statement Analyzer</Header>
      
      <UploadCard>
        <InputGroup>
          <Label>Statement PDF</Label>
          <FileInput 
            type="file" 
            accept=".pdf"
            onChange={handleFileChange}
          />
          {fileName && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#7f8c8d' }}>
              Selected: {fileName}
            </div>
          )}
        </InputGroup>

        <DateRangeContainer>
          <div style={{ flex: 1 }}>
            <Label>From Date</Label>
            <DateInput 
              type="date" 
              value={fromDate}
              onChange={e => setFromDate(e.target.value)} 
            />
          </div>
          <div style={{ flex: 1 }}>
            <Label>To Date</Label>
            <DateInput 
              type="date" 
              value={toDate}
              onChange={e => setToDate(e.target.value)} 
            />
          </div>
        </DateRangeContainer>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <SubmitButton 
          onClick={handleUpload}
          disabled={isLoading}
          isLoading={isLoading}
        >
          {isLoading ? 'Analyzing Statement...' : 'Analyze Statement'}
        </SubmitButton>
      </UploadCard>

      {transactions.length > 0 && (
        <>
          <SummaryCard>
            <SummaryItem>
              <strong>Total Credit</strong>
              <span>₹{totals.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </SummaryItem>
            <SummaryItem>
              <strong>Total Debit</strong>
              <span>₹{totals.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </SummaryItem>
            <SummaryItem>
              <strong>Net Balance</strong>
              <span>₹{(totals.credit - totals.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </SummaryItem>
          </SummaryCard>

          <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Transaction Details</h3>
          <TransactionTable>
            <TableHeader>
              <div>Date</div>
              <div>Description</div>
              <div>Amount</div>
              <div>Type</div>
            </TableHeader>
            {transactions.map((transaction, index) => (
              <TableRow key={index} index={index}>
                <div>{format(new Date(transaction.date), 'dd MMM yyyy')}</div>
                <div>{transaction.description}</div>
                <AmountCell>₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</AmountCell>
                <TypeCell type={transaction.type}>{transaction.type}</TypeCell>
              </TableRow>
            ))}
          </TransactionTable>
        </>
      )}
    </Container>
  );
}

export default Find;