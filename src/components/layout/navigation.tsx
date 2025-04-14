"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    BookOpen,
    CreditCard,
    LineChart,
    Settings,
} from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";

interface NavigationItem {
    title: string;
    href: string;
    icon: React.ReactNode;
}

export default function Navigation() {
    const pathname = usePathname();

    const navigationItems: NavigationItem[] = [
        {
            title: "Dashboard",
            href: "/dashboard",
            icon: <BarChart3 className="w-5 h-5" />,
        },
        {
            title: "Stocks",
            href: "/stocks",
            icon: <LineChart className="w-5 h-5" />,
        },
        {
            title: "Transactions",
            href: "/transactions",
            icon: <CreditCard className="w-5 h-5" />,
        },
        {
            title: "Notes",
            href: "/notes",
            icon: <BookOpen className="w-5 h-5" />,
        },
        {
            title: "Settings",
            href: "/settings",
            icon: <Settings className="w-5 h-5" />,
        },
    ];

    return (
        <header className= "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" >
        <div className="container flex h-16 items-center" >
            <div className="flex items-center gap-2 font-bold text-lg mr-4" >
                <LineChart className="h-6 w-6" />
                    <span>StockManager </span>
                    </div>
                    < nav className = "flex items-center space-x-4 lg:space-x-6 mx-6" >
                    {
                        navigationItems.map((item) => (
                            <Link
              key= { item.href }
              href = { item.href }
              className = {
                                cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                                    pathname === item.href
                                ? "text-foreground"
                                : "text-muted-foreground"
                        )
                    }
                        >
                        { item.icon }
                        < span className = "ml-2" > { item.title } </span>
                            </Link>
          ))
}
</nav>
    < div className = "ml-auto flex items-center space-x-4" >
        <ModeToggle />
        </div>
        </div>
        </header>
  );
}