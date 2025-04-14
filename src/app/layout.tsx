import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import Navigation from '@/components/layout/navigation';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Stock Market Manager',
    description: 'Manage your stock portfolio with ease',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div className="flex min-h-screen flex-col">
                        <Navigation />
                        <main className="flex-1 container mx-auto py-6 px-4 md:px-6">
                            {children}
                        </main>
                        <footer className="border-t py-4">
                            <div className="container mx-auto text-center text-sm text-muted-foreground">
                                &copy; {new Date().getFullYear()} - Personal Stock Manager
                            </div>
                        </footer>
                    </div>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}