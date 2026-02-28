import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import Charts from './Charts';

// --- Interfaces ---
interface Transaction {
  _id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

interface FormData {
  title: string;
  amount: string; // Kept as string for input handling, converted to number on submit
  category: string;
}

interface DashboardProps {
  token: string;
  onLogout: () => void;
}

interface ApiResponse<T> {
  success: boolean;
  transactions?: T;
  transaction?: T;
  insights?: string[];
  message?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ token, onLogout }) => {
  // --- State Management ---
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    amount: '',
    category: 'Food'
  });
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showInsights, setShowInsights] = useState<boolean>(false);

  const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other'];

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const fetchTransactions = async () => {
    try {
      const response = await axios.get<ApiResponse<Transaction[]>>(
        'http://localhost:5000/api/transactions',
        getAuthConfig()
      );
      
      if (response.data.success && response.data.transactions) {
        setTransactions(response.data.transactions);
      }
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error(err);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert amount string to number for the API call
      const payload = { ...formData, amount: parseFloat(formData.amount) };
      
      const response = await axios.post<ApiResponse<Transaction>>(
        'http://localhost:5000/api/transactions',
        payload,
        getAuthConfig()
      );

      if (response.data.success && response.data.transaction) {
        setTransactions([response.data.transaction, ...transactions]);
        setFormData({ title: '', amount: '', category: 'Food' });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await axios.delete<ApiResponse<null>>(
        `http://localhost:5000/api/transactions/${id}`,
        getAuthConfig()
      );

      if (response.data.success) {
        setTransactions(transactions.filter(t => t._id !== id));
      }
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  const getAIInsights = async () => {
    setAiLoading(true);
    setError('');

    try {
      const response = await axios.post<ApiResponse<string[]>>(
        'http://localhost:5000/api/ai/insights',
        {},
        getAuthConfig()
      );

      if (response.data.success && response.data.insights) {
        setAiInsights(response.data.insights);
        setShowInsights(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get AI insights');
    } finally {
      setAiLoading(false);
    }
  };

  const getTotalSpending = (): number => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center glass p-6 rounded-2xl">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gradient neon-glow" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              AI Finance Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Track your expenses with AI-powered insights</p>
          </div>
          <button
            onClick={onLogout}
            className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="glass p-6 animate-fade-in">
              <h3 className="text-sm text-gray-400 mb-2">Total Spending</h3>
              <p className="text-4xl font-bold text-gradient">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(getTotalSpending())}
              </p>            
              <p className="text-sm text-gray-500 mt-2">{transactions.length} transactions</p>
            </div>

            <div className="glass p-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                Add Expense
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Grocery shopping"
                    className="input-neon"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="50.00"
                    step="0.01"
                    min="0"
                    className="input-neon"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-neon"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-neon w-full disabled:opacity-50"
                >
                  {loading ? 'Adding...' : '+ Add Transaction'}
                </button>
              </form>
            </div>

            <button
              onClick={getAIInsights}
              disabled={aiLoading || transactions.length === 0}
              className="w-full glass-hover p-6 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gradient group-hover:neon-glow transition-all" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    ✨ Get AI Advice
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {aiLoading ? 'Analyzing...' : 'Powered by Gemini 2.5 Flash'}
                  </p>
                </div>
                <div className="text-3xl group-hover:scale-110 transition-transform">🤖</div>
              </div>
            </button>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {showInsights && aiInsights.length > 0 && (
              <div className="glass p-6 animate-slide-up border-2 border-neon-cyan/30">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gradient" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    🤖 AI Financial Insights
                  </h3>
                  <button onClick={() => setShowInsights(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                <div className="space-y-3">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="flex gap-3 glass-hover p-4 rounded-lg">
                      <span className="text-neon-cyan font-bold">{index + 1}.</span>
                      <p className="text-gray-200 leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {transactions.length > 0 && <Charts transactions={transactions} />}

            <div className="glass p-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                Recent Transactions
              </h3>
              
              {transactions.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                  {transactions.map((transaction) => (
                    <div key={transaction._id} className="glass-hover p-4 rounded-lg flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{transaction.title}</h4>
                        <div className="flex gap-4 mt-1">
                          <span className="text-sm text-gray-400">{transaction.category}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-neon-cyan">
                            ₹{transaction.amount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No transactions yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;