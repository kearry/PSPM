import { z } from "zod";
import { TransactionType, TransactionTypeValue } from "./constants";

// Stock validation schema
export const stockSchema = z.object({
    ticker: z.string().min(1, "Ticker is required").max(10, "Ticker must be 10 characters or less").toUpperCase(),
    name: z.string().min(1, "Company name is required").max(100, "Company name must be 100 characters or less"),
    sectorId: z.string().optional(),
});

// Stock with note validation schema
export const stockWithNoteSchema = stockSchema.extend({
    includeNote: z.boolean().default(false),
    noteContent: z.string().max(1000, "Note must be 1000 characters or less").optional(),
}).refine(
    (data) => !data.includeNote || (data.includeNote && data.noteContent && data.noteContent.length > 0),
    {
        message: "Note content is required when including a note",
        path: ["noteContent"],
    }
);

export type StockFormValues = z.infer<typeof stockSchema>;

// Transaction validation schema
export const transactionSchema = z.object({
    stockId: z.string().min(1, "Stock is required"),
    type: z.enum([TransactionType.BUY, TransactionType.SELL], {
        errorMap: () => ({ message: "Transaction type is required" }),
    }),
    quantity: z.number().positive("Quantity must be positive"),
    price: z.number().positive("Price must be positive"),
    date: z.date({
        required_error: "Date is required",
        invalid_type_error: "That's not a valid date",
    }),
});

// Transaction with note validation schema
export const transactionWithNoteSchema = transactionSchema.extend({
    includeNote: z.boolean().default(false),
    noteContent: z.string().max(1000, "Note must be 1000 characters or less").optional(),
}).refine(
    (data) => !data.includeNote || (data.includeNote && data.noteContent && data.noteContent.length > 0),
    {
        message: "Note content is required when including a note",
        path: ["noteContent"],
    }
);

export type TransactionFormValues = z.infer<typeof transactionSchema>;
export type TransactionWithNoteFormValues = z.infer<typeof transactionWithNoteSchema>;

// Note validation schema
export const noteSchema = z.object({
    content: z.string().min(1, "Content is required").max(1000, "Content must be 1000 characters or less"),
    stockId: z.string().optional(),
    transactionId: z.string().optional(),
});

export type NoteFormValues = z.infer<typeof noteSchema>;

// Sector validation schema
export const sectorSchema = z.object({
    name: z.string().min(1, "Sector name is required").max(100, "Sector name must be 100 characters or less"),
});

export type SectorFormValues = z.infer<typeof sectorSchema>;

// User profile validation schema
export const userProfileSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
    email: z.string().email("Invalid email address"),
});

export type StockWithNoteFormValues = z.infer<typeof stockWithNoteSchema>;
export type UserProfileFormValues = z.infer<typeof userProfileSchema>;