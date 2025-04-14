import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LineChart, BarChart3, CreditCard, BookOpen, Settings } from "lucide-react";

export default function HomePage() {
    // Redirect to dashboard by default
    redirect("/dashboard");

    // This code won't execute due to the redirect, but we'll include it for completeness
    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center space-y-6 max-w-2xl px-4">
                <LineChart className="mx-auto h-16 w-16" />
                <h1 className="text-4xl font-bold">Welcome to Stock Manager</h1>
                <p className="text-xl text-muted-foreground">
                    Track your stock portfolio, manage transactions, and keep notes all in one place.
                </p>
                <div className="grid gap-4 md:grid-cols-2 mt-8">
                    <div className="border rounded-lg p-6 text-left space-y-4">
                        <BarChart3 className="h-8 w-8" />
                        <h2 className="text-xl font-semibold">Dashboard</h2>
                        <p className="text-sm text-muted-foreground">
                            Get a visual overview of your portfolio value and sector allocation.
                        </p>
                        <Link href="/dashboard">
                            <Button size="sm">View Dashboard</Button>
                        </Link>
                    </div>
                    <div className="border rounded-lg p-6 text-left space-y-4">
                        <LineChart className="h-8 w-8" />
                        <h2 className="text-xl font-semibold">Stocks</h2>
                        <p className="text-sm text-muted-foreground">
                            Manage your stock holdings and view detailed information.
                        </p>
                        <Link href="/stocks">
                            <Button size="sm">View Stocks</Button>
                        </Link>
                    </div>
                    <div className="border rounded-lg p-6 text-left space-y-4">
                        <CreditCard className="h-8 w-8" />
                        <h2 className="text-xl font-semibold">Transactions</h2>
                        <p className="text-sm text-muted-foreground">
                            Record buy and sell transactions for your portfolio.
                        </p>
                        <Link href="/transactions">
                            <Button size="sm">View Transactions</Button>
                        </Link>
                    </div>
                    <div className="border rounded-lg p-6 text-left space-y-4">
                        <BookOpen className="h-8 w-8" />
                        <h2 className="text-xl font-semibold">Notes</h2>
                        <p className="text-sm text-muted-foreground">
                            Keep track of your investment research and ideas.
                        </p>
                        <Link href="/notes">
                            <Button size="sm">View Notes</Button>
                        </Link>
                    </div>
                </div>
                <div className="mt-8">
                    <Link href="/settings">
                        <Button variant="outline">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}