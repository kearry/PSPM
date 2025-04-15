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

    const form = useForm<TransactionWithNoteFormValues>({
        resolver: zodResolver(transactionWithNoteSchema),
        defaultValues: {
            stockId: stock?.id || "",
            type: TransactionType.BUY,
            quantity: 0,
            price: 0,
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
                date: new Date(),
                includeNote: false,
                noteContent: "",
            });
            setIncludeNote(false);
        }
    }, [open, stock, form]);

    // Handle the include note checkbox
    const handleIncludeNoteChange = (checked: boolean) => {
        setIncludeNote(checked);
        form.setValue("includeNote", checked);
    };

    const onSubmit = async (data: TransactionWithNoteFormValues) => {
        setIsLoading(true);
        try {
            // Extract transaction data
            const transactionData: TransactionFormValues = {
                stockId: data.stockId,
                type: data.type,
                quantity: data.quantity,
                price: data.price,
                date: data.date,
            };

            // Create transaction
            const result = await createTransaction(transactionData);

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
                                </FormItem>
                            )}
                        />

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