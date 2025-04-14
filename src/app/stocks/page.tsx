import { Metadata } from "next";
import { getStocks, getSectors } from "@/actions/stocks";
import { getTransactions } from "@/actions/transactions";
import StocksHeader from "@/components/stocks/stocks-header";
import StocksTable from "@/components/stocks/stocks-table";
import { calculateAveragePrice, calculateTotalHoldings } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Stocks | Stock Manager",
    description: "Manage your stock portfolio",
};

export default async function StocksPage() {
    const [stocksResponse, transactionsResponse, sectorsResponse] = await Promise.all([
        getStocks(),
        getTransactions(),
        getSectors(),
    ]);

    const stocks = stocksResponse.success ? stocksResponse.data ?? [] : [];
    const transactions = transactionsResponse.success ? transactionsResponse.data ?? [] : [];
    const sectors = sectorsResponse.success ? sectorsResponse.data ?? [] : [];

    // Enhance stock data with calculated fields
    const enhancedStocks = stocks.map((stock) => {
        const stockTransactions = transactions.filter(
            (transaction) => transaction.stockId === stock.id
        );

        const averagePrice = calculateAveragePrice(stockTransactions);
        const holdings = calculateTotalHoldings(stockTransactions);
        const value = holdings * averagePrice;

        return {
            ...stock,
            averagePrice,
            holdings,
            value,
            transactions: stockTransactions.length,
        };
    });

    return (
        <div className="space-y-6">
            <StocksHeader />
            <StocksTable stocks={enhancedStocks} sectors={sectors} />
        </div>
    );
}