// Define transaction types as string constants to replace enum
export const TransactionType = {
    BUY: 'BUY',
    SELL: 'SELL',
} as const;

export type TransactionTypeValue = typeof TransactionType[keyof typeof TransactionType];