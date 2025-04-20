import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Currency } from "@/lib/validators";

interface Stock {
    id: string;
    ticker: string;
    name: string;
    createdAt: Date;
    sector: { id: string; name: string } | null;
    averagePrice: number;
    holdings: number;
    value: number;
    currency: Currency;
    transactions: { id: string }[];
}

interface StockDetailsProps {
    stock: Stock;
}

export default function StockDetails({ stock }: StockDetailsProps) {
    const { currency } = stock;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stock Details</CardTitle>
                <CardDescription>
                    Key information about {stock.ticker}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    {/* static fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Ticker" value={stock.ticker} />
                        <Field label="Company" value={stock.name} />
                        <Field label="Sector" value={stock.sector?.name || "—"} />
                        <Field label="Added" value={formatDate(stock.createdAt)} />
                    </div>

                    {/* dynamic fields */}
                    <div className="border-t pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Field
                                label="Shares"
                                value={
                                    stock.holdings > 0
                                        ? stock.holdings.toFixed(2)
                                        : "0.00"
                                }
                            />
                            <Field
                                label="Average Price"
                                value={
                                    stock.averagePrice > 0
                                        ? formatCurrency(stock.averagePrice, currency)
                                        : "—"
                                }
                            />
                            <Field
                                label="Total Value"
                                value={formatCurrency(stock.value, currency)}
                            />
                            <Field
                                label="Transactions"
                                value={stock.transactions.length.toString()}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function Field({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div>
            <div className="text-sm font-medium text-muted-foreground">
                {label}
            </div>
            <div className="text-lg font-medium">{value}</div>
        </div>
    );
}