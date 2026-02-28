import mongoose, { Document, Model, Schema, Types } from 'mongoose';

/**
 * Allowed transaction categories
 */
export type TransactionCategory =
  | 'Food'
  | 'Transport'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Health'
  | 'Other';

/**
 * Interface representing the Transaction document fields
 */
export interface ITransaction extends Document {
  userId: Types.ObjectId;
  title: string;
  amount: number;
  category: TransactionCategory;
  date: Date;
  createdAt: Date; // from timestamps: true
  updatedAt: Date; // from timestamps: true
}

/**
 * Transaction Schema
 * Stores user expense data with title, amount, category, and date
 * Links to user via userId for authentication
 */
const transactionSchema = new Schema<ITransaction>(
  {
    // User who created this transaction (references User model)
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Transaction details
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive']
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other'] as TransactionCategory[],
      default: 'Other' as TransactionCategory
    },

    // Auto-generated timestamp
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);

/**
 * Index for faster queries by userId
 * Improves performance when fetching user-specific transactions
 */
transactionSchema.index({ userId: 1, date: -1 });

// Export the Transaction model
const Transaction: Model<ITransaction> = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;