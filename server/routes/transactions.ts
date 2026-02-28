import express, { Router, Response } from 'express';
import Transaction from '../models/Transaction.ts';
import { authMiddleware, AuthRequest } from '../middleware/auth.ts';

const router: Router = express.Router();

/**
 * All transaction routes are protected by authMiddleware
 * This ensures only authenticated users can access their transactions
 */

/**
 * GET ALL TRANSACTIONS
 * GET /api/transactions
 * Returns all transactions for the authenticated user
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });

  } catch (error: unknown) {
    console.error('Get Transactions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

/**
 * CREATE TRANSACTION
 * POST /api/transactions
 * Creates a new transaction for the authenticated user
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, amount, category } = req.body as {
      title?: string;
      amount?: number | string;
      category?: string;
    };

    // Validate required fields
    if (!title || !amount || !category) {
      res.status(400).json({
        success: false,
        message: 'Title, amount, and category are required'
      });
      return;
    }

    // Validate amount is positive
    if (Number(amount) <= 0) {
      res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
      return;
    }

    // Create new transaction linked to user
    const transaction = await Transaction.create({
      userId: req.userId,
      title,
      amount: parseFloat(String(amount)),
      category
    });

    res.status(201).json({
      success: true,
      message: 'Transaction added successfully',
      transaction
    });

  } catch (error: unknown) {
    console.error('Create Transaction Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction'
    });
  }
});

/**
 * DELETE TRANSACTION
 * DELETE /api/transactions/:id
 * Deletes a specific transaction (only if it belongs to the user)
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Find and delete transaction (only if it belongs to the user)
    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error: unknown) {
    console.error('Delete Transaction Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction'
    });
  }
});

export default router;