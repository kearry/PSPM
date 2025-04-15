import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TransactionType } from "./constants";
import { Currency } from "./validators";

/**
 * Combines class names with tailwind merge
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Gets the currency symbol for a currency code
 */
export function getCurrencySymbol(currency: Currency | string = 'GBP'): string {
    const symbols: { [key: string]: string } = {
        'GBP': '£',
        'USD': '$',
        'EUR': '€',
        'JPY': '¥',
        'CHF': 'Fr',
        'CAD': 'C$',
        'AUD': 'A$',
    };

    return symbols[currency] || currency;
}

/**
 * Formats a number as currency
 */
export function formatCurrency(amount: number, currency: Currency | string = 'GBP'): string {
    const locale = currency === 'GBP' ? 'en-GB' : 'en-US';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(amount);
}

/**
 * Formats a date
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}

/**
 * Calculates the total cost or proceeds of a transaction, including FX fees if applicable
 */
export function calculateTransactionTotal(transaction: {
    quantity: number;
    price: number;
    type: string;
    currency?: string;
    exchangeRate?: number | null;
    fxFee?: number | null;
}): number {
    const baseAmount = transaction.quantity * transaction.price;

    // If there's an exchange rate, convert the amount
    const convertedAmount = transaction.exchangeRate
        ? baseAmount * transaction.exchangeRate
        : baseAmount;

    // For BUY transactions, add FX fee; for SELL transactions, subtract FX fee
    if (transaction.fxFee) {
        if (transaction.type === TransactionType.BUY) {
            return convertedAmount + transaction.fxFee;
        } else {
            return convertedAmount - transaction.fxFee;
        }
    }

    return convertedAmount;
}

/**
 * Calculates average purchase price for a stock based on transactions
 */
export function calculateAveragePrice(transactions: {
    type: string;
    quantity: number;
    price: number;
    currency?: string;
    exchangeRate?: number | null;
}[]): number {
    const buyTransactions = transactions.filter(
        (transaction) => transaction.type === TransactionType.BUY
    );

    if (buyTransactions.length === 0) return 0;

    const totalCost = buyTransactions.reduce(
        (sum, transaction) => {
            // Apply exchange rate if available
            const convertedPrice = transaction.exchangeRate
                ? transaction.price * transaction.exchangeRate
                : transaction.price;

            return sum + transaction.quantity * convertedPrice;
        },
        0
    );

    const totalQuantity = buyTransactions.reduce(
        (sum, transaction) => sum + transaction.quantity,
        0
    );

    return totalCost / totalQuantity;
}

/**
 * Calculates total holdings (quantity) for a stock based on transactions
 */
export function calculateTotalHoldings(transactions: {
    type: string;
    quantity: number;
}[]): number {
    return transactions.reduce((total, transaction) => {
        if (transaction.type === TransactionType.BUY) {
            return total + transaction.quantity;
        } else {
            return total - transaction.quantity;
        }
    }, 0);
}

/**
 * Creates a GUID
 */
export function generateId(): string {
    return crypto.randomUUID();
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(prisma: any, {
    action,
    entityType,
    entityId,
    userId,
    payload,
}: {
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    payload?: any;
}) {
    return prisma.auditLog.create({
        data: {
            action,
            entityType,
            entityId,
            userId,
            payload: payload ? JSON.stringify(payload) : "",
        }
    });
}

/**
 * Exports data to CSV format
 */
export function exportToCSV(data: any[], filename: string) {
    // Convert data to CSV format
    const csvRows = [];

    // Get headers
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            // Handle special cases (dates, objects, etc.)
            if (value instanceof Date) {
                return `"${formatDate(value)}"`;
            } else if (typeof value === 'string') {
                // Escape quotes and wrap in quotes
                return `"${value.replace(/"/g, '""')}"`;
            } else if (typeof value === 'object' && value !== null) {
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvRows.push(values.join(','));
    }

    // Create blob and download link
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    if (typeof window !== 'undefined') {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return csvString;
}