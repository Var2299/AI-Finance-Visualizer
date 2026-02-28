import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, TooltipProps 
} from 'recharts';

// --- Interfaces ---
interface Transaction {
  _id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

interface CategoryData {
  name: string;
  value: number;
}

interface TrendData {
  date: string;
  amount: number;
}

interface ChartsProps {
  transactions: Transaction[];
}

// Vibrant neon colors for charts
const COLORS = [
  '#ff0080', // Neon Pink
  '#b300ff', // Neon Purple
  '#00d4ff', // Neon Blue
  '#00ffff', // Cyan
  '#00ff88', // Neon Green
  '#ffeb3b', // Yellow
  '#ff6b35', // Orange
];

const Charts: React.FC<ChartsProps> = ({ transactions }) => {
  
  const getCategoryData = (): CategoryData[] => {
    const categoryMap: Record<string, number> = {};
    
    transactions.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
    
    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
  };

  const getTrendData = (): TrendData[] => {
    const dateMap: Record<string, number> = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date).toISOString().split('T')[0];
      dateMap[date] = (dateMap[date] || 0) + t.amount;
    });
    
    return Object.entries(dateMap)
      .map(([date, amount]) => ({
        date, // Keep raw date for sorting
        displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: parseFloat(amount.toFixed(2))
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(({ displayDate, amount }) => ({ date: displayDate, amount })) // Return formatted
      .slice(-10);
  };

  const categoryData = getCategoryData();
  const trendData = getTrendData();
  const totalValue = categoryData.reduce((acc, item) => acc + item.value, 0);

  /**
   * Custom tooltip for Donut Chart
   */
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      const percentage = value ? ((value / totalValue) * 100).toFixed(1) : 0; 

      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{name}</p>
          <p className="text-blue-600">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Category Breakdown - Donut Chart */}
      <div className="glass p-6 animate-fade-in">
        <h3 className="text-xl font-bold text-gradient mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Spending by Category
        </h3>
        
        {categoryData.length > 0 ? (
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/2">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1200}
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="w-full md:w-1/2 space-y-2">
              {categoryData.map((entry, index) => (
                <div 
                  key={entry.name} 
                  className="flex items-center justify-between glass-hover p-3 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-lg"
                      style={{ 
                        backgroundColor: COLORS[index % COLORS.length],
                        boxShadow: `0 0 10px ${COLORS[index % COLORS.length]}80`
                      }}
                    ></div>
                    <span className="text-white font-medium">{entry.name}</span>
                  </div>
                  <span className="text-neon-cyan font-bold"> ₹{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No data available.</p>
        )}
      </div>

      {/* Spending Trend - Area Chart */}
      <div className="glass p-6 animate-fade-in">
        <h3 className="text-xl font-bold text-gradient mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Spending Trend
        </h3>
        
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff0080" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#b300ff" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#ffffff80"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#ffffff80"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass p-3 rounded-lg border border-white/20">
                        <p className="text-white font-semibold">{payload[0].payload.date}</p>
                        <p className="text-neon-cyan"> ₹{payload[0].value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#ff0080" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-8">No trend data available.</p>
        )}
      </div>
    </div>
  );
};

export default Charts;