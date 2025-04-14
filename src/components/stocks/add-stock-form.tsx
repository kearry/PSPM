"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StockFormValues, stockSchema } from "@/lib/validators";
import { createStock, getSectors } from "@/actions/stocks";
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

interface AddStockFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AddStockForm({ open, onOpenChange }: AddStockFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [sectors, setSectors] = useState<{ id: string; name: string }[]>([]);

    const form = useForm<StockFormValues>({
        resolver: zodResolver(stockSchema),
        defaultValues: {
            ticker: "",
            name: "",
            sectorId: undefined,
        },
    });

    // Load sectors when dialog opens
    const handleOpenChange = async (open: boolean) => {
        onOpenChange(open);
        if (open && sectors.length === 0) {
            const { success, data } = await getSectors();
            if (success && data) {
                setSectors(data);
            }
        }
    };

    const onSubmit = async (data: StockFormValues) => {
        setIsLoading(true);
        try {
            const result = await createStock(data);

            if (result.success) {
                toast({
                    title: "Stock added",
                    description: `${data.ticker} has been added to your portfolio.`,
                });
                form.reset();
                onOpenChange(false);
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to add stock.",
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Stock</DialogTitle>
                    <DialogDescription>
                        Add a new stock to your portfolio
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
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a sector" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="">None</SelectItem>
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
                                {isLoading ? "Adding..." : "Add Stock"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}