import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getNoteById } from "@/actions/notes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { ChevronLeftIcon } from "lucide-react";
import NoteActions from "@/components/notes/note-actions";

interface NotePageProps {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
    const { success, data, error } = await getNoteById(params.id);

    if (!success || !data) {
        return {
            title: "Note Not Found | Stock Manager",
        };
    }

    return {
        title: `Note | Stock Manager`,
        description: `View note details`,
    };
}

export default async function NotePage({ params }: NotePageProps) {
    const { success, data: note, error } = await getNoteById(params.id);

    if (!success || !note) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link
                        href="/notes"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
                    >
                        <ChevronLeftIcon className="h-4 w-4" />
                        Back to Notes
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight">Note Details</h2>
                </div>
                <NoteActions note={note} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div>
                            {note.stock ? (
                                <Link href={`/stocks/${note.stock.id}`} className="hover:underline">
                                    {note.stock.ticker}: {note.stock.name}
                                </Link>
                            ) : note.transaction ? (
                                <Link href={`/transactions/${note.transaction.id}`} className="hover:underline">
                                    Transaction for {note.transaction.stock.ticker}
                                </Link>
                            ) : (
                                "General Note"
                            )}
                        </div>
                        <div className="text-sm font-normal text-muted-foreground">
                            {formatDate(note.createdAt)}
                        </div>
                    </CardTitle>
                    <CardDescription>
                        {note.stock
                            ? `Note for ${note.stock.ticker}`
                            : note.transaction
                                ? `Note for transaction of ${note.transaction.stock.ticker}`
                                : "General investment note"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="whitespace-pre-wrap">{note.content}</div>
                </CardContent>
            </Card>
        </div>
    );
}