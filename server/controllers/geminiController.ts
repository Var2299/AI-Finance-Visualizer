import { GoogleGenerativeAI } from '@google/generative-ai';
import { Request, Response } from 'express';
import Transaction from '../models/Transaction.ts';

// Extend Express Request to include userId (set by auth middleware)
interface AuthRequest extends Request {
  userId?: string;
}

interface CategoryBreakdown {
  [category: string]: number;
}

interface TransactionDoc {
  amount: number | string;
  category?: string;
  title?: string;
  date: Date | string;
}

interface InsightStats {
  total: number;
  totalFormatted: string;
  avgTransaction: number;
  avgTransactionFormatted: string;
  topCategory: string;
  topCategoryValue: number;
  transactionCount: number;
}

interface InsightsSuccessResponse {
  success: true;
  insights: string[];
  stats?: InsightStats;
}

interface InsightsErrorResponse {
  success: false;
  message: string;
}

export const getAIInsights = async (
  req: AuthRequest,
  res: Response<InsightsSuccessResponse | InsightsErrorResponse>
): Promise<void> => {
  try {
    // Fetch all transactions for the authenticated user
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ date: -1 }) // Most recent first
      .limit(50) as TransactionDoc[]; // Limit to last 50 transactions for performance

    // Check if user has any transactions
    if (!transactions || transactions.length === 0) {
      res.status(200).json({
        success: true,
        insights: [
          'Start by adding your first expense to get personalized AI insights.',
          'Track at least 5-10 transactions for meaningful analysis.',
          'Try to categorize your expenses accurately for better recommendations.'
        ]
      });
      return;
    }

    // Helper: format numbers to Indian Rupees (₹) with Indian grouping
    const formatINR = (amount: number): string =>
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
      }).format(Number(amount) || 0);

    // Calculate spending statistics (ensure numeric)
    const totalSpending: number = transactions.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );

    // Group spending by category
    const categoryBreakdown: CategoryBreakdown = transactions.reduce(
      (acc: CategoryBreakdown, t: TransactionDoc) => {
        const cat = t.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + Number(t.amount || 0);
        return acc;
      },
      {}
    );

    // Find highest spending category (safely)
    const topCategoryEntry: [string, number] =
      (Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a)[0] as [string, number]) ||
      (['N/A', 0] as [string, number]);

    // Calculate average transaction amount (safe divide)
    const avgTransaction: number = transactions.length
      ? totalSpending / transactions.length
      : 0;

    // Get recent transaction count (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount: number = transactions.filter(
      (t) => new Date(t.date) > sevenDaysAgo
    ).length;

    // Create a detailed prompt for Gemini — using ₹ and Indian formatted numbers
    const prompt = `
You are a financial advisor. Analyze this user's spending data and provide exactly 4 concise, actionable financial tips.

SPENDING SUMMARY:
- Total Spent: ${formatINR(totalSpending)}
- Number of Transactions: ${transactions.length}
- Average Transaction: ${formatINR(avgTransaction)}
- Recent Activity: ${recentCount} transactions in the last 7 days
- Top Spending Category: ${topCategoryEntry[0]} (${formatINR(topCategoryEntry[1])})

CATEGORY BREAKDOWN:
${Object.entries(categoryBreakdown)
  .map(
    ([cat, amt]) =>
      `- ${cat}: ${formatINR(amt)} (${(((amt as number) / (totalSpending || 1)) * 100).toFixed(1)}%)`
  )
  .join('\n')}

RECENT TRANSACTIONS (Last 5):
${transactions
  .slice(0, 5)
  .map(
    (t) =>
      `- ${t.title || 'Untitled'}: ${formatINR(Number(t.amount))} (${t.category || 'Uncategorized'})`
  )
  .join('\n')}

Provide exactly 4 bullet points of actionable advice. Each point should be:
- Specific to their spending patterns
- Actionable (something they can do)
- Concise (1-2 sentences max)
- Practical and realistic

Format: Return ONLY the 4 bullet points, one per line, starting with "•". No introduction or conclusion.
`;

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Generate insights from Gemini
    const result = await model.generateContent(prompt);
    const geminiResponse = result.response;
    const aiText: string = geminiResponse.text();

    // Parse the response into an array of insights
    const insights: string[] = aiText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => line.replace(/^[•\-\*]\s*/, '')) // Remove bullet characters
      .filter((line) => line.length > 10); // Filter out very short lines

    // Return insights to frontend
    res.status(200).json({
      success: true,
      insights: insights.slice(0, 4), // Ensure up to 4 insights
      stats: {
        total: totalSpending,
        totalFormatted: formatINR(totalSpending),
        avgTransaction,
        avgTransactionFormatted: formatINR(avgTransaction),
        topCategory: topCategoryEntry[0],
        topCategoryValue: topCategoryEntry[1],
        transactionCount: transactions.length
      }
    });

  } catch (error: unknown) {
    console.error('AI Insights Error:', error);

    // Handle Gemini API errors gracefully
    if (error instanceof Error && error.message?.includes('API key')) {
      res.status(500).json({
        success: false,
        message: 'AI service configuration error. Please check API key.'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate insights. Please try again.'
    });
  }
};