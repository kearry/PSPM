"use server";

import { prisma } from "@/lib/db";
import { TransactionFormValues } from "@/lib/validators";
import { createAuditLog } from "@/lib/utils";
import { getCurrentUser } from "./user";
import { revalidatePath } from "next/cache";

/**
 * Get all transactions for the current user
 */
export async function getTransactions() {
    try {
        const user = await getCurrentUser();

        const transactions = await prisma.transaction.findMany({
            where: { userId: user.id },
            include: {
                stock: true,
            },
            orderBy: { date: "desc" },
        });

        return { success: true, data: transactions };
    } catch (error) {
        console.error("Error getting transactions:", error);
        return { success: false, error: "Failed to fetch transactions" };
    }
}

/**
 * Get a transaction by ID
 */
export async function getTransactionById(id: string) {
    try {
        const user = await getCurrentUser();

        const transaction = await prisma.transaction.findFirst({
            where: {
                id,
                userId: user.id,
            },
            include: {
                stock: true,
                notes: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!transaction) {
            return { success: false, error: "Transaction not found" };
        }

        return { success: true, data: transaction };
    } catch (error) {
        console.error("Error getting transaction:", error);
        return { success: false, error: "Failed to fetch transaction" };
    }
}

/**
 * Create a new transaction
 */
export async function createTransaction(data: TransactionFormValues) {
    try {
        const user = await getCurrentUser();

        // Check if stock exists and belongs to user
        const stock = await prisma.stock.findFirst({
            where: {
                id: data.stockId,
                userId: user.id,
            },
        });

        if (!stock) {
            return { success: false, error: "Stock not found" };
        }

        // Create the transaction
        const transaction = await prisma.transaction.create({
            data: {
                stockId: data.stockId,
                userId: user.id,
                type: data.type,
                quantity: data.quantity,
                price: data.price,
                date: data.date,
            },
            include: {
                stock: true,
            },
        });

        // Create audit log
        await createAuditLog(prisma, {
            action: "CREATE_TRANSACTION",
            entityType: "Transaction",
            entityId: transaction.id,
            userId: user.id,
            payload: {
                stockTicker: transaction.stock.ticker,
                type: transaction.type,
                quantity: transaction.quantity,
                price: transaction.price,
            },
        });

        revalidatePath("/transactions");
        revalidatePath(`/stocks/${data.stockId}`);
        revalidatePath("/dashboard");

        return { success: true, data: transaction };
    } catch (error) {
        console.error("Error creating transaction:", error);
        return { success: false, error: "Failed to create transaction" };
    }
}

/**
 * Update a transaction
 */
export async function updateTransaction(id: string, data: TransactionFormValues) {
    try {
        const user = await getCurrentUser();

        // Check if transaction exists and belongs to user
        const transaction = await prisma.transaction.findFirst({
            where: {
                id,
                userId: user.id,
            },
            include: {
                stock: true,
            },
        });

        if (!transaction) {
            return { success: false, error: "Transaction not found" };
        }

        // Check if stock exists and belongs to user
        const stock = await prisma.stock.findFirst({
            where: {
                id: data.stockId,
                userId: user.id,
            },
        });

        if (!stock) {
            return { success: false, error: "Stock not found" };
        }

        // Update the transaction
        const updatedTransaction = await prisma.transaction.update({
            where: { id },
            data: {
                stockId: data.stockId,
                type: data.type,
                quantity: data.quantity,
                price: data.price,
                date: data.date,
            },
            include: {
                stock: true,
            },
        });

        // Create audit log
        await createAuditLog(prisma, {
            action: "UPDATE_TRANSACTION",
            entityType: "Transaction",
            entityId: updatedTransaction.id,
            userId: user.id,
            payload: {
                stockTicker: updatedTransaction.stock.ticker,
                type: updatedTransaction.type,
                quantity: updatedTransaction.quantity,
                price: updatedTransaction.price,
            },
        });

        revalidatePath("/transactions");
        revalidatePath(`/transactions/${id}`);
        revalidatePath(`/stocks/${transaction.stockId}`);
        revalidatePath(`/stocks/${data.stockId}`);
        revalidatePath("/dashboard");

        return { success: true, data: updatedTransaction };
    } catch (error) {
        console.error("Error updating transaction:", error);
        return { success: false, error: "Failed to update transaction" };
    }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string) {
    try {
        const user = await getCurrentUser();

        // Check if transaction exists and belongs to user
        const transaction = await prisma.transaction.findFirst({
            where: {
                id,
                userId: user.id,
            },
            include: {
                stock: true,
                notes: true,
            },
        });

        if (!transaction) {
            return { success: false, error: "Transaction not found" };
        }

        // Delete related notes
        if (transaction.notes.length > 0) {
            await prisma.note.deleteMany({
                where: {
                    transactionId: id,
                },
            });
        }

        // Delete the transaction
        await prisma.transaction.delete({
            where: { id },
        });

        // Create audit log
        await createAuditLog(prisma, {
            action: "DELETE_TRANSACTION",
            entityType: "Transaction",
            entityId: id,
            userId: user.id,
            payload: {
                stockTicker: transaction.stock.ticker,
                type: transaction.type,
            },
        });

        revalidatePath("/transactions");
        revalidatePath(`/stocks/${transaction.stockId}`);
        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        console.error("Error deleting transaction:", error);
        return { success: false, error: "Failed to delete transaction" };
    }
}

/**
 * Export transactions to CSV
 */
export async function exportTransactionsToCSV() {
    try {
        const user = await getCurrentUser();

        const transactions = await prisma.transaction.findMany({
            where: { userId: user.id },
            include: {
                stock: {
                    select: {
                        ticker: true,
                        name: true,
                    },
                },
            },
            orderBy: { date: "desc" },
        });

        // Format data for CSV export
        const exportData = transactions.map((transaction) => ({
            Date: transaction.date,
            Ticker: transaction.stock.ticker,
            Company: transaction.stock.name,
            Type: transaction.type,
            Quantity: transaction.quantity,
            Price: transaction.price,
            Total: transaction.price * transaction.quantity,
        }));

        return { success: true, data: exportData };
    } catch (error) {
        console.error("Error exporting transactions:", error);
        return { success: false, error: "Failed to export transactions" };
    }
}