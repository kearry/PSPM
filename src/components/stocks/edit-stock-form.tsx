"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StockWithNoteFormValues, stockWithNoteSchema, Currency } from "@/lib/validators";
import { updateStock, getSectors } from "@/actions/stocks";
import { createNote, getNotesByStockId } from "@/actions/notes";
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
import { getCurrencySymbol } from "@/lib/utils";
import { getCurrentUser } from "@/actions/user";

interface Stock {
    id: string;
    ticker: string;
    name: string;
    sectorId: string | null;
    currency: Currency;
    notes?: {
        id: string;
        content: string;
    }[];
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
    const [includeNewNote, setIncludeNewNote] = useState(false);
    const [sectorLoadError, setSectorLoadError] = useState<string | null>(null);
    const [existingNotes, setExistingNotes] = useState<{ id: string; content: string }[]>([]);
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [notesLoadError, setNotesLoadError] = useState<string | null>(null);
    const [userDefaultCurrency, setUserDefaultCurrency] = useState<Currency>("GBP");

    const form = useForm<StockWithNoteFormValues>({
        resolver: zodResolver(stockWithNoteSchema),
        defaultValues: {
            ticker: stock.ticker,
            name: stock.name,
            sectorId: stock.sectorId || "none",
            currency: stock.currency || "USD",
            includeNote: false,
            noteContent: "",
        },
    });

    // Get user's default currency
    useEffect(() => {
        const fetchUserCurrency = async () => {
            try {
                const user = await getCurrentUser();
                // Cast to Currency to ensure it's one of the allowed values
                setUserDefaultCurrency((user.defaultCurrency || "GBP") as Currency);
            } catch (error) {
                console.error("Error fetching user currency:", error);
            }
        };

        if (open) {
            fetchUserCurrency();
        }
    }, [open]);

    // Load sectors when dialog opens
    useEffect(() => {
        const loadSectors = async () => {
            if (open && sectors.length === 0) {
                setIsLoading(true);
                try {
                    const { success, data, error } = await getSectors();
                    if (success && data) {
                        setSectors(data);
                        setSectorLoadError(null);
                    } else {
                        console.error("Error loading sectors:", error);
                        setSectorLoadError(error || "Failed to load sectors.");
                        toast({
                            title: "Error loading sectors",
                            description: error || "Failed to load sectors.",
                            variant: "destructive",
                        });
                    }
                } catch (error) {
                    console.error("Unexpected error loading sectors:", error);
                    setSectorLoadError("An unexpected error occurred while loading sectors.");
                    toast({
                        title: "Error loading sectors",
                        description: "An unexpected error occurred.",
                        variant: "destructive",
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadSectors();
    }, [open, sectors.length, toast]);

    // Load existing notes when dialog opens and stock ID is available
    useEffect(() => {
        const loadExistingNotes = async () => {
            if (open && stock?.id) {
                setLoadingNotes(true);
                try {
                    const { success, data, error } = await getNotesByStockId(stock.id);
                    if (success && data) {
                        setExistingNotes(data);
                        setNotesLoadError(null);
                    } else {
                        console.error("Error loading notes:", error);
                        setNotesLoadError(error || "Failed to load notes.");
                    }
                } catch (error) {
                    console.error("Unexpected error loading notes:", error);
                    setNotesLoadError("An unexpected error occurred while loading notes.");
                } finally {
                    setLoadingNotes(false);
                }
            } else {
                setExistingNotes([]); // Clear notes if dialog is closed or no stock
            }
        };

        loadExistingNotes();
    }, [open, stock?.id]);

    // Reset includeNewNote state and form values on open
    useEffect(() => {
        if (open) {
            setIncludeNewNote(false);
            form.setValue("includeNote", false);
            form.setValue("noteContent", "");
        }
    }, [open, form]);

    // Update form values when stock prop changes
    useEffect(() => {
        form.reset({
            ticker: stock.ticker,
            name: stock.name,
            sectorId: stock.sectorId || "none",
            currency: stock.currency || "USD",
            includeNote: false,
            noteContent: "",
        });
        setIncludeNewNote(false);
    }, [stock, form]);

    // Handle the include new note checkbox
    const handleIncludeNewNoteChange = (checked: boolean) => {
        setIncludeNewNote(checked);
        form.setValue("includeNote", checked); // Update form value for validation
    };

    const onSubmit = async (data: StockWithNoteFormValues) => {
        setIsLoading(true);
        try {
            const stockData = {
                ticker: data.ticker,
                name: data.name,
                sectorId: data.sectorId,
                currency: data.currency,
            };

            const result = await updateStock(stock.id, stockData);

            if (result.success) {
                // If including a new note and note content is provided
                if (data.includeNote && data.noteContent) {
                    const noteResult = await createNote({
                        content: data.noteContent,
                        stockId: stock.id,
                    });
                    if (!noteResult.success) {
                        toast({
                            title: "Warning",
                            description: noteResult.error || "Note could not be added.",
                            variant: "default",
                        });
                    }
                }

                const currencySymbol = getCurrencySymbol(data.currency);
                toast({
                    title: "Stock updated",
                    description: `${data.ticker} has been updated (${currencySymbol} ${data.currency}).`,
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Stock</DialogTitle>
                    <DialogDescription>
                        Update stock information and view or add new notes.
                    </DialogDescription>
                </DialogHeader>

                {/* Display Existing Notes */}
                {loadingNotes ? (
                    <p className="text-muted-foreground text-sm">Loading existing notes...</p>
                ) : notesLoadError ? (
                    <p className="text-destructive text-sm">Error loading notes: {notesLoadError}</p>
                ) : existingNotes.length > 0 ? (
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold mb-2">Existing Notes</h3>
                        <ul className="list-disc pl-4 text-sm text-muted-foreground">
                            {existingNotes.map((note) => (
                                <li key={note.id}>{note.content}</li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm mb-4">No existing notes for this stock.</p>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Ticker and Name fields remain the same */}
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
                            name="currency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Currency</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a currency" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="USD">{getCurrencySymbol("USD")} USD - US Dollar</SelectItem>
                                            <SelectItem value="GBP">{getCurrencySymbol("GBP")} GBP - British Pound</SelectItem>
                                            <SelectItem value="EUR">{getCurrencySymbol("EUR")} EUR - Euro</SelectItem>
                                            <SelectItem value="JPY">{getCurrencySymbol("JPY")} JPY - Japanese Yen</SelectItem>
                                            <SelectItem value="CHF">{getCurrencySymbol("CHF")} CHF - Swiss Franc</SelectItem>
                                            <SelectItem value="CAD">{getCurrencySymbol("CAD")} CAD - Canadian Dollar</SelectItem>
                                            <SelectItem value="AUD">{getCurrencySymbol("AUD")} AUD - Australian Dollar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        {field.value !== userDefaultCurrency ?
                                            `This differs from your default currency (${getCurrencySymbol(userDefaultCurrency)} ${userDefaultCurrency}). Exchange rates will be needed for transactions.` :
                                            `This matches your default currency (${getCurrencySymbol(userDefaultCurrency)} ${userDefaultCurrency}).`
                                        }
                                    </FormDescription>
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
                                        onValueChange={(value) => field.onChange(value)}
                                        value={field.value || "none"}
                                        disabled={isLoading || (sectorLoadError !== null && sectors.length === 0)}
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
                                                handleIncludeNewNoteChange(checked === true); // Use the new handler
                                            }}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Add a new note
                                        </FormLabel>
                                        <FormDescription>
                                            Include a new note for this stock. This will not edit existing notes.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {includeNewNote && (
                            <FormField
                                control={form.control}
                                name="noteContent"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Note</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter your new note here..."
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
                            <Button type="submit" disabled={isLoading || (sectorLoadError !== null && sectors.length === 0)}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}