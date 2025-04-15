"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionFormValues, transactionSchema, TransactionWithNoteFormValues, transactionWithNoteSchema } from "@/lib/validators";
import { createTransaction } from "@/actions/transactions";
import { createNote } from "@/actions/notes";
import { TransactionType } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getStocks } from "@/actions/stocks";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface Stock {
    id: string;
    ticker: string;
    name: string;
}

interface AddTransactionFormProps {
    stock?: Stock;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AddTransactionForm({
    stock,
    open,
    onOpenChange,
}: AddTransactionFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingStocks, setIsLoadingStocks] = useState(false);
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [includeNote, setIncludeNote] = useState(false);
    const [isForeignCurrency, setIsForeignCurrency] = useState(false);

    const form = useForm<TransactionWithNoteFormValues>({
        resolver: zodResolver(transactionWithNoteSchema),
        defaultValues: {
            stockId: stock?.id || "",
            type: TransactionType.BUY,
            quantity: 0,
            price: 0,
            exchangeRate: 1,
            fxFee: 0,
            date: new Date(),
            includeNote: false,
            noteContent: "",
        },
    });

    // Load stocks when dialog opens
    useEffect(() => {
        async function loadStocks() {
            if (open && !stock) {
                setIsLoadingStocks(true);
                try {
                    const { success, data } = await getStocks();
                    if (success && data) {
                        setStocks(data);
                    } else {
                        console.error("Failed to load stocks");
                    }
                } catch (error) {
                    console.error("Error loading stocks:", error);
                } finally {
                    setIsLoadingStocks(false);
                }
            }
        }

        loadStocks();
    }, [open, stock]);

    // Reset form when opening
    useEffect(() => {
        if (open) {
            form.reset({
                stockId: stock?.id || "",
                type: TransactionType.BUY,
                quantity: 0,
                price: 0,
                exchangeRate: 1,
                fxFee: 0,
                date: new Date(),
                includeNote: false,
                noteContent: "",
            });
            setIncludeNote(false);
            setIsForeignCurrency(false);
        }
    }, [open, stock, form]);

    // Handle the include note checkbox
    const handleIncludeNoteChange = (checked: boolean) => {
        setIncludeNote(checked);
        form.setValue("includeNote", checked);
    };

    // Toggle foreign currency fields
    const handleForeignCurrencyToggle = (checked: boolean) => {
        setIsForeignCurrency(checked);
        if (!checked) {
            form.setValue("exchangeRate", 1);
            form.setValue("fxFee", 0);
        }
    };

    // Calculate total cost based on current form values
    const calculateTotal = () => {
        const values = form.getValues();
        const baseTotal = values.quantity * values.price;

        if (isForeignCurrency && values.exchangeRate) {
            const convertedTotal = baseTotal * values.exchangeRate;
            if (values.fxFee) {
                return values.type === TransactionType.BUY
                    ? convertedTotal + values.fxFee
                    : convertedTotal - values.fxFee;
            }
            return convertedTotal;
        }

        return baseTotal;
    };

    const onSubmit = async (data: TransactionWithNoteFormValues) => {
        setIsLoading(true);
        try {
            // If not using foreign currency, set exchange rate to 1 and fx fee to 0
            if (!isForeignCurrency) {
                data.exchangeRate = 1;
                data.fxFee = 0;
            }

            // Create transaction
            const result = await createTransaction(data);

            if (result.success) {
                // If including a note and transaction created successfully
                if (data.includeNote && data.noteContent && result.data) {
                    // Create note linked to the transaction
                    await createNote({
                        content: data.noteContent,
                        transactionId: result.data.id,
                    });
                }

                // Get stock details for the toast message
                const selectedStock = stock || stocks.find(s => s.id === data.stockId);
                const ticker = selectedStock?.ticker || "stock";

                toast({
                    title: "Transaction added",
                    description: `${data.type === TransactionType.BUY ? "Bought" : "Sold"} ${data.quantity} shares of ${ticker}.`,
                });
                form.reset();
                onOpenChange(false);
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to add transaction.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                    <DialogDescription>
                        Record a buy or sell transaction for {stock?.ticker || "a stock"}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="stockId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stock</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={!!stock || isLoadingStocks} // Disable if stock is provided or loading
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={isLoadingStocks ? "Loading stocks..." : "Select a stock"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {stock ? (
                                                <SelectItem value={stock.id}>
                                                    {stock.ticker}: {stock.name}
                                                </SelectItem>
                                            ) : (
                                                stocks.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>
                                                        {s.ticker}: {s.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Transaction Type</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select transaction type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={TransactionType.BUY}>Buy</SelectItem>
                                            <SelectItem value={TransactionType.SELL}>Sell</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="10"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price per Share</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="150.00"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Foreign Currency Checkbox */}
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={isForeignCurrency}
                                    onCheckedChange={handleForeignCurrencyToggle}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Foreign Currency Transaction
                                </FormLabel>
                                <FormDescription>
                                    Enable if this transaction was made in a foreign currency
                                </FormDescription>
                            </div>
                        </FormItem>

                        {/* Exchange Rate - only shown when foreign currency is enabled */}
                        {isForeignCurrency && (
                            <FormField
                                control={form.control}
                                name="exchangeRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Exchange Rate</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.0001"
                                                placeholder="1.0"
                                                {...field}
                                                value={field.value || 1}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Exchange rate to convert to local currency (e.g., 1.35 USD per EUR)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* FX Fee - only shown when foreign currency is enabled */}
                        {isForeignCurrency && (
                            <FormField
                                control={form.control}
                                name="fxFee"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>FX Fee</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                value={field.value || 0}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Fee charged for currency conversion
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Display the total transaction value */}
                        {form.getValues("quantity") > 0 && form.getValues("price") > 0 && (
                            <div className="text-sm bg-muted p-3 rounded-md">
                                <div className="font-medium">Transaction Total:</div>
                                <div className="text-lg font-bold">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                    }).format(calculateTotal())}
                                </div>
                                {isForeignCurrency && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {form.getValues("quantity")} shares × {form.getValues("price")}
                                        {isForeignCurrency ? " × " + form.getValues("exchangeRate") + " exchange rate" : ""}
                                        {isForeignCurrency && form.getValues("fxFee") ?
                                            (form.getValues("type") === TransactionType.BUY ?
                                                " + " : " - ") + form.getValues("fxFee") + " FX fee" :
                                            ""}
                                    </div>
                                )}
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Transaction Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="includeNote"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={(checked) => {
                                                field.onChange(checked);
                                                handleIncludeNoteChange(checked === true);
                                            }}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Add a note to this transaction
                                        </FormLabel>
                                        <FormDescription>
                                            Include notes about your investment decision or other details
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {includeNote && (
                            <FormField
                                control={form.control}
                                name="noteContent"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Note</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter your note here..."
                                                className="min-h-32"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading || (!stock && !form.getValues("stockId"))}>
                                {isLoading ? "Adding..." : "Add Transaction"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}