"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StockWithNoteFormValues, stockWithNoteSchema } from "@/lib/validators";
import { updateStock, getSectors } from "@/actions/stocks";
import { createNote } from "@/actions/notes";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface Stock {
    id: string;
    ticker: string;
    name: string;
    sectorId: string | null;
}

interface EditStockFormProps {
    stock: Stock;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EditStockForm({ stock, open, onOpenChange }: EditStockFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [sectors, setSectors] = useState<{ id: string; name: string }[]>([]);
    const [includeNote, setIncludeNote] = useState(false);

    const form = useForm<StockWithNoteFormValues>({
        resolver: zodResolver(stockWithNoteSchema),
        defaultValues: {
            ticker: stock.ticker,
            name: stock.name,
            sectorId: stock.sectorId || "none", // Use "none" as default if no sector
            includeNote: false,
            noteContent: "",
        },
    });

    // Load sectors when dialog opens
    const handleOpenChange = async (open: boolean) => {
        onOpenChange(open);

        if (open) {
            // Reset includeNote state when opening the form
            setIncludeNote(false);

            if (sectors.length === 0) {
                const { success, data } = await getSectors();
                if (success && data) {
                    setSectors(data);
                }
            }
        }
    };

    // Update form values when stock changes
    useEffect(() => {
        form.reset({
            ticker: stock.ticker,
            name: stock.name,
            sectorId: stock.sectorId || "none", // Ensure "none" is used when sectorId is null
            includeNote: false,
            noteContent: "",
        });
        setIncludeNote(false);
    }, [stock, form]);

    // Handle the include note checkbox
    const handleIncludeNoteChange = (checked: boolean) => {
        setIncludeNote(checked);
        form.setValue("includeNote", checked);
    };

    const onSubmit = async (data: StockWithNoteFormValues) => {
        setIsLoading(true);
        try {
            // Extract stock data without note fields
            const stockData = {
                ticker: data.ticker,
                name: data.name,
                sectorId: data.sectorId,
            };

            const result = await updateStock(stock.id, stockData);

            if (result.success) {
                // If including a note and stock updated successfully
                if (data.includeNote && data.noteContent) {
                    // Create note linked to the stock
                    await createNote({
                        content: data.noteContent,
                        stockId: stock.id,
                    });
                }

                toast({
                    title: "Stock updated",
                    description: `${data.ticker} has been updated.`,
                });
                onOpenChange(false);
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to update stock.",
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
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Stock</DialogTitle>
                    <DialogDescription>
                        Update stock information
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="ticker"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ticker Symbol</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="AAPL"
                                            {...field}
                                            value={field.value}
                                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Apple Inc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sectorId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sector</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value || "none"} // Always use "none" if value is empty or null
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a sector" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {sectors.map((sector) => (
                                                <SelectItem key={sector.id} value={sector.id}>
                                                    {sector.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                            Add a note to this stock
                                        </FormLabel>
                                        <FormDescription>
                                            Include notes about this stock, investment thesis, or research
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
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}