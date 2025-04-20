// -----------------------------------------------------------------------------
//  src/app/dashboard/page.tsx     (complete replacement file)
// -----------------------------------------------------------------------------
import { Metadata } from "next";

import { getCurrentUser } from "@/actions/user";
import { getStocks } from "@/actions/stocks";
import { getTransactions } from "@/actions/transactions";

import {
    calculateAveragePrice,
    calculateTotalHoldings,
} from "@/lib/utils";

import DashboardHeader from "@/components/dashboard/dashboard-header";
import PortfolioValue from "@/components/dashboard/portfolio-value";
import StockSummary from "@/components/dashboard/stock-summary";
import SectorBreakdown from "@/components/dashboard/sector-breakdown";
import RecentTransactions from "@/components/dashboard/recent-transactions";

import { Currency } from "@/lib/validators";

export const metadata: Metadata = {
    title: "Dashboard | Stock Manager",
    description: "View your stock portfolio at a glance",
};

export default async function DashboardPage() {
    /* ----------------------------------------------------------------------- */
    /* 1. Fetch data                                                            */
    /* ----------------------------------------------------------------------- */
    const [user, stocksRes, txRes] = await Promise.all([
        getCurrentUser(),
        getStocks(),
        getTransactions(),
    ]);

    const rawStocks = stocksRes.success ? stocksRes.data ?? [] : [];
    const rawTx = txRes.success ? txRes.data ?? [] : [];

    const userCurrency = (user.defaultCurrency || "GBP") as Currency;

    /* ----------------------------------------------------------------------- */
    /* 2.   Cast currency literals & compute per‑stock metrics                  */
    /* ----------------------------------------------------------------------- */
    const transactions = rawTx.map((t) => ({
        ...t,
        currency: (t.currency || t.stock.currency || "USD") as Currency,
        stock: { ...t.stock, currency: (t.stock.currency || "USD") as Currency },
    }));

    const stocks = rawStocks.map((s) => ({
        ...s,
        currency: (s.currency || "USD") as Currency,
    }));

    const stocksWithMetrics = stocks.map((s) => {
        const txForStock = transactions.filter((t) => t.stockId === s.id);
        const averagePrice = calculateAveragePrice(txForStock);
        const holdings = calculateTotalHoldings(txForStock);
        const value = holdings * averagePrice;
        return { ...s, averagePrice, holdings, value };
    });

    /* ----------------------------------------------------------------------- */
    /* 3.   Aggregate portfolio & sector data                                   */
    /* ----------------------------------------------------------------------- */
    const portfolioValue = stocksWithMetrics.reduce(
        (sum, s) => sum + s.value,
        0,
    );

    const sectorMap = stocksWithMetrics.reduce<Record<string, number>>(
        (acc, s) => {
            if (s.holdings === 0) return acc;
            const name = s.sector?.name || "Uncategorised";
            acc[name] = (acc[name] || 0) + s.value;
            return acc;
        },
        {},
    );

    const sectorBreakdown = Object.entries(sectorMap).map(([name, value]) => ({
        name,
        value,
        percentage: portfolioValue ? (value / portfolioValue) * 100 : 0,
    }));

    /* five most‑recent transactions */
    const recentTransactions = [...transactions]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5);

    /* ----------------------------------------------------------------------- */
    /* 4.   Render                                                              */
    /* ----------------------------------------------------------------------- */
    return (
        <div className="space-y-6">
            <DashboardHeader
                username={user.name}
                portfolioValue={portfolioValue}
                currency={userCurrency}
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <PortfolioValue
                    portfolioValue={portfolioValue}
                    stocksCount={stocksWithMetrics.length}
                    currency={userCurrency}
                />

                <SectorBreakdown sectors={sectorBreakdown} currency={userCurrency} />

                <RecentTransactions
                    transactions={recentTransactions}
                /* this component doesn’t yet need baseCurrency */
                />
            </div>

            <StockSummary stocks={stocksWithMetrics} />
        </div>
    );
}