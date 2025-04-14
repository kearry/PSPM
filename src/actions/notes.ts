"use server";

import { prisma } from "@/lib/db";
import { NoteFormValues } from "@/lib/validators";
import { createAuditLog } from "@/lib/utils";
import { getCurrentUser } from "./user";
import { revalidatePath } from "next/cache";

/**
 * Get all notes for the current user
 */
export async function getNotes() {
    try {
        const user = await getCurrentUser();

        const notes = await prisma.note.findMany({
            where: { userId: user.id },
            include: {
                stock: true,
                transaction: {
                    include: {
                        stock: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, data: notes };
    } catch (error) {
        console.error("Error getting notes:", error);
        return { success: false, error: "Failed to fetch notes" };
    }
}

/**
 * Get a note by ID
 */
export async function getNoteById(id: string) {
    try {
        const user = await getCurrentUser();

        const note = await prisma.note.findFirst({
            where: {
                id,
                userId: user.id,
            },
            include: {
                stock: true,
                transaction: {
                    include: {
                        stock: true,
                    },
                },
            },
        });

        if (!note) {
            return { success: false, error: "Note not found" };
        }

        return { success: true, data: note };
    } catch (error) {
        console.error("Error getting note:", error);
        return { success: false, error: "Failed to fetch note" };
    }
}

/**
 * Create a new note
 */
export async function createNote(data: NoteFormValues) {
    try {
        const user = await getCurrentUser();

        // Validate if stock exists if stockId is provided
        if (data.stockId) {
            const stock = await prisma.stock.findFirst({
                where: {
                    id: data.stockId,
                    userId: user.id,
                },
            });

            if (!stock) {
                return { success: false, error: "Stock not found" };
            }
        }

        // Validate if transaction exists if transactionId is provided
        if (data.transactionId) {
            const transaction = await prisma.transaction.findFirst({
                where: {
                    id: data.transactionId,
                    userId: user.id,
                },
            });

            if (!transaction) {
                return { success: false, error: "Transaction not found" };
            }
        }

        // Create the note
        const note = await prisma.note.create({
            data: {
                content: data.content,
                stockId: data.stockId || null,
                transactionId: data.transactionId || null,
                userId: user.id,
            },
            include: {
                stock: true,
                transaction: true,
            },
        });

        // Create audit log
        await createAuditLog(prisma, {
            action: "CREATE_NOTE",
            entityType: "Note",
            entityId: note.id,
            userId: user.id,
            payload: {
                stockTicker: note.stock?.ticker,
                transactionId: note.transaction?.id,
            },
        });

        revalidatePath("/notes");

        if (data.stockId) {
            revalidatePath(`/stocks/${data.stockId}`);
        }

        if (data.transactionId) {
            revalidatePath(`/transactions/${data.transactionId}`);
        }

        return { success: true, data: note };
    } catch (error) {
        console.error("Error creating note:", error);
        return { success: false, error: "Failed to create note" };
    }
}

/**
 * Update a note
 */
export async function updateNote(id: string, data: NoteFormValues) {
    try {
        const user = await getCurrentUser();

        // Check if note exists and belongs to user
        const note = await prisma.note.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!note) {
            return { success: false, error: "Note not found" };
        }

        // Validate if stock exists if stockId is provided
        if (data.stockId) {
            const stock = await prisma.stock.findFirst({
                where: {
                    id: data.stockId,
                    userId: user.id,
                },
            });

            if (!stock) {
                return { success: false, error: "Stock not found" };
            }
        }

        // Validate if transaction exists if transactionId is provided
        if (data.transactionId) {
            const transaction = await prisma.transaction.findFirst({
                where: {
                    id: data.transactionId,
                    userId: user.id,
                },
            });

            if (!transaction) {
                return { success: false, error: "Transaction not found" };
            }
        }

        // Update the note
        const updatedNote = await prisma.note.update({
            where: { id },
            data: {
                content: data.content,
                stockId: data.stockId || null,
                transactionId: data.transactionId || null,
            },
            include: {
                stock: true,
                transaction: true,
            },
        });

        // Create audit log
        await createAuditLog(prisma, {
            action: "UPDATE_NOTE",
            entityType: "Note",
            entityId: updatedNote.id,
            userId: user.id,
            payload: {
                stockTicker: updatedNote.stock?.ticker,
                transactionId: updatedNote.transaction?.id,
            },
        });

        revalidatePath("/notes");
        revalidatePath(`/notes/${id}`);

        if (note.stockId) {
            revalidatePath(`/stocks/${note.stockId}`);
        }

        if (data.stockId && note.stockId !== data.stockId) {
            revalidatePath(`/stocks/${data.stockId}`);
        }

        if (note.transactionId) {
            revalidatePath(`/transactions/${note.transactionId}`);
        }

        if (data.transactionId && note.transactionId !== data.transactionId) {
            revalidatePath(`/transactions/${data.transactionId}`);
        }

        return { success: true, data: updatedNote };
    } catch (error) {
        console.error("Error updating note:", error);
        return { success: false, error: "Failed to update note" };
    }
}

/**
 * Delete a note
 */
export async function deleteNote(id: string) {
    try {
        const user = await getCurrentUser();

        // Check if note exists and belongs to user
        const note = await prisma.note.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!note) {
            return { success: false, error: "Note not found" };
        }

        // Store references to linked items for path revalidation
        const stockId = note.stockId;
        const transactionId = note.transactionId;

        // Delete the note
        await prisma.note.delete({
            where: { id },
        });

        // Create audit log
        await createAuditLog(prisma, {
            action: "DELETE_NOTE",
            entityType: "Note",
            entityId: id,
            userId: user.id,
        });

        revalidatePath("/notes");

        if (stockId) {
            revalidatePath(`/stocks/${stockId}`);
        }

        if (transactionId) {
            revalidatePath(`/transactions/${transactionId}`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error deleting note:", error);
        return { success: false, error: "Failed to delete note" };
    }
}