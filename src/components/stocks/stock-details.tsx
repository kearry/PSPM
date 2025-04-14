import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Stock {
    id: string;
    ticker: string;
    name: string;
    createdAt: Date;
    sector: {
        id: string;
        name: string;
    } | null;
    averagePrice: number;
    holdings: number;
    value: number;
    transactions: {
        id: string;
    }[];
}

interface StockDetailsProps {
    stock: Stock;
}

export default function StockDetails({ stock }: StockDetailsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Stock Details</CardTitle>
                <CardDescription>Key information about {stock.ticker}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Ticker</div>
                            <div>{stock.ticker}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Company</div>
                            <div>{stock.name}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Sector</div>
                            <div>{stock.sector?.name || "—"}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Added</div>
                            <div>{formatDate(stock.createdAt)}</div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Shares</div>
                                <div className="text-lg font-medium">
                                    {stock.holdings > 0 ? stock.holdings.toFixed(2) : "0.00"}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Average Price</div>
                                <div className="text-lg font-medium">
                                    {stock.averagePrice > 0 ? formatCurrency(stock.averagePrice) : "—"}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Total Value</div>
                                <div className="text-lg font-medium">
                                    {formatCurrency(stock.value)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Transactions</div>
                                <div className="text-lg font-medium">
                                    {stock.transactions.length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}