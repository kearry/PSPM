"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StockWithNoteFormValues, stockWithNoteSchema } from "@/lib/validators";
import { createStock, getSectors } from "@/actions/stocks";
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

interface AddStockFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AddStockForm({ open, onOpenChange }: AddStockFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [sectors, setSectors] = useState<{ id: string; name: string }[]>([]);
    const [includeNote, setIncludeNote] = useState(false);
    const [sectorLoadError, setSectorLoadError] = useState<string | null>(null); // State for sector loading errors

    const form = useForm<StockWithNoteFormValues>({
        resolver: zodResolver(stockWithNoteSchema),
        defaultValues: {
            ticker: "",
            name: "",
            sectorId: "none",
            includeNote: false,
            noteContent: "",
        },
    });

    // Load sectors when dialog opens
    useEffect(() => {
        const loadSectors = async () => {
            if (open && sectors.length === 0) {
                const { success, data, error } = await getSectors();
                if (success && data) {
                    setSectors(data);
                    setSectorLoadError(null); // Clear any previous error
                } else {
                    console.error("Error loading sectors:", error);
                    setSectorLoadError(error || "Failed to load sectors.");
                    toast({
                        title: "Error loading sectors",
                        description: error || "Failed to load sectors.",
                        variant: "destructive",
                    });
                }
            }
        };

        loadSectors();
    }, [open, sectors.length, toast]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            form.reset({
                ticker: "",
                name: "",
                sectorId: "none",
                includeNote: false,
                noteContent: "",
            });
            setIncludeNote(false);
            setSectorLoadError(null); // Clear error on close
        }
    }, [open, form]);

    // Handle the include note checkbox
    const handleIncludeNoteChange = (checked: boolean) => {
        setIncludeNote(checked);
        form.setValue("includeNote", checked);
    };

    const onSubmit = async (data: StockWithNoteFormValues) => {
        setIsLoading(true);
        try {
            const result = await createStock({
                ticker: data.ticker,
                name: data.name,
                sectorId: data.sectorId,
            });

            if (result.success) {
                if (data.includeNote && data.noteContent && result.data) {
                    await createNote({
                        content: data.noteContent,
                        stockId: result.data.id,
                    });
                }

                toast({
                    title: "Stock added",
                    description: `${data.ticker} has been added to your portfolio.`,
                });
                form.reset({
                    ticker: "",
                    name: "",
                    sectorId: "none",
                    includeNote: false,
                    noteContent: "",
                });
                setIncludeNote(false);
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                                        value={field.value || "none"}
                                        disabled={sectorLoadError !== null && sectors.length === 0} // Disable if loading failed and no sectors
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={sectorLoadError || "Select a sector"} />
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
                                    {sectorLoadError && (
                                        <FormMessage className="text-destructive">
                                            {sectorLoadError}
                                        </FormMessage>
                                    )}
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
                            <Button type="submit" disabled={isLoading || sectorLoadError !== null && sectors.length === 0}>
                                {isLoading ? "Adding..." : "Add Stock"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}