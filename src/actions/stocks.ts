"use server";

import { prisma } from "@/lib/db";
import { StockFormValues } from "@/lib/validators";
import { createAuditLog } from "@/lib/utils";
import { getCurrentUser } from "./user";
import { revalidatePath } from "next/cache";

/**
 * Get all stocks for the current user
 */
export async function getStocks() {
    try {
        const user = await getCurrentUser();

        const stocks = await prisma.stock.findMany({
            where: { userId: user.id },
            include: {
                sector: true,
                transactions: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, data: stocks };
    } catch (error) {
        console.error("Error getting stocks:", error);
        return { success: false, error: "Failed to fetch stocks" };
    }
}

/**
 * Get a stock by ID
 */
export async function getStockById(id: string) {
    try {
        const user = await getCurrentUser();

        const stock = await prisma.stock.findFirst({
            where: {
                id,
                userId: user.id,
            },
            include: {
                sector: true,
                transactions: {
                    orderBy: { date: "desc" },
                },
                notes: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!stock) {
            return { success: false, error: "Stock not found" };
        }

        return { success: true, data: stock };
    } catch (error) {
        console.error("Error getting stock:", error);
        return { success: false, error: "Failed to fetch stock" };
    }
}

/**
 * Create a new stock
 */
export async function createStock(data: StockFormValues) {
    try {
        const user = await getCurrentUser();

        // Check if stock with same ticker already exists for this user
        const existingStock = await prisma.stock.findFirst({
            where: {
                ticker: data.ticker.toUpperCase(),
                userId: user.id,
            },
        });

        if (existingStock) {
            return { success: false, error: "You already have a stock with this ticker" };
        }

        // Create the stock
        const stock = await prisma.stock.create({
            data: {
                ticker: data.ticker.toUpperCase(),
                name: data.name,
                sectorId: data.sectorId || null,
                userId: user.id,
            },
        });

        // Create audit log
        await createAuditLog(prisma, {
            action: "CREATE_STOCK",
            entityType: "Stock",
            entityId: stock.id,
            userId: user.id,
            payload: {
                ticker: stock.ticker,
                name: stock.name,
            },
        });

        revalidatePath("/stocks");

        return { success: true, data: stock };
    } catch (error) {
        console.error("Error creating stock:", error);
        return { success: false, error: "Failed to create stock" };
    }
}

/**
 * Update a stock
 */
export async function updateStock(id: string, data: StockFormValues) {
    try {
        const user = await getCurrentUser();

        // Check if stock exists and belongs to user
        const stock = await prisma.stock.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!stock) {
            return { success: false, error: "Stock not found" };
        }

        // Check if updated ticker already exists for another stock
        if (data.ticker.toUpperCase() !== stock.ticker) {
            const existingStock = await prisma.stock.findFirst({
                where: {
                    ticker: data.ticker.toUpperCase(),
                    userId: user.id,
                    id: { not: id },
                },
            });

            if (existingStock) {
                return { success: false, error: "You already have a stock with this ticker" };
            }
        }

        // Update the stock
        const updatedStock = await prisma.stock.update({
            where: { id },
            data: {
                ticker: data.ticker.toUpperCase(),
                name: data.name,
                sectorId: data.sectorId || null,
            },
        });

        // Create audit log
        await createAuditLog(prisma, {
            action: "UPDATE_STOCK",
            entityType: "Stock",
            entityId: updatedStock.id,
            userId: user.id,
            payload: {
                ticker: updatedStock.ticker,
                name: updatedStock.name,
            },
        });

        revalidatePath("/stocks");
        revalidatePath(`/stocks/${id}`);

        return { success: true, data: updatedStock };
    } catch (error) {
        console.error("Error updating stock:", error);
        return { success: false, error: "Failed to update stock" };
    }
}

/**
 * Delete a stock
 */
export async function deleteStock(id: string) {
    try {
        const user = await getCurrentUser();

        // Check if stock exists and belongs to user
        const stock = await prisma.stock.findFirst({
            where: {
                id,
                userId: user.id,
            },
            include: {
                transactions: true,
                notes: true,
            },
        });

        if (!stock) {
            return { success: false, error: "Stock not found" };
        }

        // Check if stock has transactions
        if (stock.transactions.length > 0) {
            return {
                success: false,
                error: "Cannot delete a stock with transactions. Delete the transactions first."
            };
        }

        // Delete related notes
        if (stock.notes.length > 0) {
            await prisma.note.deleteMany({
                where: {
                    stockId: id,
                },
            });
        }

        // Delete the stock
        await prisma.stock.delete({
            where: { id },
        });

        // Create audit log
        await createAuditLog(prisma, {
            action: "DELETE_STOCK",
            entityType: "Stock",
            entityId: id,
            userId: user.id,
            payload: {
                ticker: stock.ticker,
            },
        });

        revalidatePath("/stocks");

        return { success: true };
    } catch (error) {
        console.error("Error deleting stock:", error);
        return { success: false, error: "Failed to delete stock" };
    }
}

/**
 * Get all sectors
 */
export async function getSectors() {
    try {
        const sectors = await prisma.sector.findMany({
            orderBy: { name: "asc" },
        });

        return { success: true, data: sectors };
    } catch (error) {
        console.error("Error getting sectors:", error);
        return { success: false, error: "Failed to fetch sectors" };
    }
}