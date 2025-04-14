"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import EditNoteForm from "@/components/notes/edit-note-form";
import DeleteNoteDialog from "@/components/notes/delete-note-dialog";

interface Note {
    id: string;
    content: string;
    createdAt: Date;
    stock?: {
        id: string;
        ticker: string;
        name: string;
    } | null;
    transaction?: {
        id: string;
        stock: {
            ticker: string;
        };
    } | null;
}

interface NotesTableProps {
    notes: Note[];
}

export default function NotesTable({ notes }: NotesTableProps) {
    const [search, setSearch] = useState("");
    const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
    const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

    // Apply search filter
    const filteredNotes = notes.filter((note) => {
        const searchLower = search.toLowerCase();
        return (
            note.content.toLowerCase().includes(searchLower) ||
            note.stock?.ticker.toLowerCase().includes(searchLower) ||
            note.stock?.name.toLowerCase().includes(searchLower) ||
            note.transaction?.stock.ticker.toLowerCase().includes(searchLower)
        );
    });

    // Sort by date (latest first)
    const sortedNotes = [...filteredNotes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return (
        <div>
            <div className="mb-4">
                <Input
                    placeholder="Search notes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-md"
                />
            </div>

            <Card>
                <CardContent className="p-0">
                    {sortedNotes.length === 0 ? (
                        <div className="py-24 text-center text-muted-foreground">
                            {notes.length === 0
                                ? "No notes yet. Add your first note to get started."
                                : "No notes match your search."}
                        </div>
                    ) : (
                        <div className="divide-y">
                            {sortedNotes.map((note) => (
                                <div key={note.id} className="p-4 sm:p-6 hover:bg-muted/50">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="space-y-1">
                                            <div className="font-medium">
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
                                            <div className="text-xs text-muted-foreground">
                                                {formatDate(note.createdAt)}
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Link href={`/notes/${note.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    View
                                                </Button>
                                            </Link>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontalIcon className="h-4 w-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => setNoteToEdit(note)}
                                                        className="cursor-pointer"
                                                    >
                                                        <PencilIcon className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setNoteToDelete(note)}
                                                        className="cursor-pointer text-destructive focus:text-destructive"
                                                    >
                                                        <TrashIcon className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                    <div className="text-sm line-clamp-3 text-muted-foreground">
                                        {note.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {noteToEdit && (
                <EditNoteForm
                    note={noteToEdit}
                    entityType={noteToEdit.stock ? "stock" : "transaction"}
                    entityId={noteToEdit.stock?.id || noteToEdit.transaction?.id || ""}
                    open={!!noteToEdit}
                    onOpenChange={(open) => {
                        if (!open) setNoteToEdit(null);
                    }}
                />
            )}

            {noteToDelete && (
                <DeleteNoteDialog
                    note={noteToDelete}
                    open={!!noteToDelete}
                    onOpenChange={(open) => {
                        if (!open) setNoteToDelete(null);
                    }}
                />
            )}
        </div>
    );
}