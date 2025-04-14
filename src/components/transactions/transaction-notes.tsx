"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
import AddNoteForm from "@/components/notes/add-note-form";
import EditNoteForm from "@/components/notes/edit-note-form";
import DeleteNoteDialog from "@/components/notes/delete-note-dialog";

interface Note {
    id: string;
    content: string;
    createdAt: Date;
}

interface TransactionNotesProps {
    transactionId: string;
    notes: Note[];
}

export default function TransactionNotes({ transactionId, notes }: TransactionNotesProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
    const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

    // Sort notes by date (latest first)
    const sortedNotes = [...notes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <CardTitle>Notes</CardTitle>
                        <CardDescription>
                            Your notes about this transaction
                        </CardDescription>
                    </div>
                    <Button size="sm" onClick={() => setShowAddForm(true)}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Note
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {notes.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <p>No notes for this transaction yet.</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => setShowAddForm(true)}
                        >
                            Add your first note
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedNotes.map((note) => (
                            <div
                                key={note.id}
                                className="border rounded-md p-4"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-xs text-muted-foreground">
                                        {formatDate(note.createdAt)}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => setNoteToEdit(note)}
                                        >
                                            <PencilIcon className="h-3 w-3" />
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive"
                                            onClick={() => setNoteToDelete(note)}
                                        >
                                            <TrashIcon className="h-3 w-3" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-sm whitespace-pre-wrap">{note.content}</div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            <AddNoteForm
                entityType="transaction"
                entityId={transactionId}
                open={showAddForm}
                onOpenChange={setShowAddForm}
            />

            {noteToEdit && (
                <EditNoteForm
                    note={noteToEdit}
                    entityType="transaction"
                    entityId={transactionId}
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
        </Card>
    );
}