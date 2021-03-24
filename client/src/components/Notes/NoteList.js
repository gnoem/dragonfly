import { useContext, useState } from "react";
import { DataContext, ViewContext } from "contexts";
import { List, ListHeader, ListHeaderButton, ListContent, ListFooter } from "../List";
import { NotePreview } from "./NotePreview";
import { SortByTag } from "./SortByTag";
import { MiniMenu } from "../MiniMenu";

export const NoteList = ({ notes, view, refreshData, createModal, closeModal }) => {
    if (!notes) return null;
    return (
        <List>
            <NoteListHeader {...{ notes, view, refreshData, createModal, closeModal }} />
            <NoteListContent {...{ notes, view }} />
        </List>
    );
}

const NoteListHeader = ({ notes, view, refreshData, createModal, closeModal }) => {
    const { updateView } = useContext(ViewContext);
    const { user } = useContext(DataContext);
    switch (view.type) {
        case 'all-notes': return (
            <ListHeader title="All notes">
                <NewNoteButton {...{ updateView }} />
            </ListHeader>
        );
        case 'starred-notes': return (
            <ListHeader title="Starred notes" />
        );
        case 'trash': return (
            <ListHeader
                title="Trash"
                button={<TrashMenuButton {...{ user, notes, refreshData, createModal, closeModal }} />}
                grid={true} />
        );
        case 'collection': return (
            <ListHeader
                title={<CollectionTitle name={view.collection.name} />}
                button={<CollectionMenuButton {...{ createModal, refreshData, updateView }} collection={view.collection} />}
                grid={true} />
        );
        case 'tags': return (
            <ListHeader>
                <SortByTag {...{ user, view, updateView, refreshData, createModal }} />
            </ListHeader>
        );
        default: return null;
    }
}

const NewNoteButton = ({ updateView }) => {
    const newNote = () => updateView(prevView => ({ ...prevView, currentNote: true }));
    return (
        <ListHeaderButton>
            <button className="createNew" onClick={newNote}>
                <span className="tooltip">Create a new note</span>
            </button>
        </ListHeaderButton>
    );
}

const TrashMenuButton = ({ user, notes, refreshData, createModal, closeModal }) => {
    const [showingMenu, setShowingMenu] = useState(false);
    const trashIsEmpty = (word) => (
        <div>
            <h2>Your Trash is empty</h2>
            No notes here to {word ?? 'select'}!
            <div className="buttons">
                <button type="button" onClick={closeModal}>Close</button>
            </div>
        </div>
    );
    const formData = { _id: user._id, onSuccess: () => refreshData() };
    const restoreAll = () => {
        if (notes.length) createModal('restoreTrash', 'form', formData);
        else createModal(trashIsEmpty('restore'));
    }
    const emptyTrash = () => {
        if (notes.length) createModal('emptyTrash', 'form', formData);
        else createModal(trashIsEmpty('delete'));
    }
    const menuItems = [{ label: 'Restore all', onClick: restoreAll }, { label: 'Empty Trash', onClick: emptyTrash }];
    return (
        <ListHeaderButton>
            <button onClick={() => setShowingMenu(true)} className="icon bar-menu round-basic"></button>
            <MiniMenu show={showingMenu} updateShow={setShowingMenu} menuItems={menuItems} />
        </ListHeaderButton>
    );
}

const CollectionMenuButton = ({ collection, updateView, createModal, refreshData }) => {
    const { _id, name } = collection;
    const [showingMenu, setShowingMenu] = useState(false);
    const onSuccessDelete = () => {
        refreshData();
        updateView({ type: 'collections' });
    }
    const editCollection = () => createModal('editCollection', 'form', { _id, name, onSuccess: () => refreshData() });
    const deleteCollection = () => createModal('deleteCollection', 'form', { _id, name, onSuccess: onSuccessDelete });
    const menuItems = [{ label: 'Edit', onClick: editCollection }, { label: 'Delete', onClick: deleteCollection }]
    return (
        <ListHeaderButton>
            <button onClick={() => setShowingMenu(true)} className="icon bar-menu round-basic"></button>
            <MiniMenu show={showingMenu} updateShow={setShowingMenu} menuItems={menuItems} />
        </ListHeaderButton>
    );
}

const CollectionTitle = ({ name }) => {
    return (
        <span className="collectionHeader">
            <span>COLLECTION</span>
            <span>{name}</span>
        </span>
    );
}

const NoteListContent = ({ view, notes }) => {
    const { updateCurrentNote } = useContext(ViewContext);
    const notesList = () => {
        return notes.map(note => (
            <NotePreview
                key={`NotePreview-${note._id}`}
                {...note}
                onClick={() => updateCurrentNote(note)}
            />
        ));
    }
    return (
        <ListContent className={(view.type === 'collection') && 'slideUpIn'} footer={<NoteListFooter {...{ view, notes }} />}>
            {notesList()}
        </ListContent>
    );
}

const NoteListFooter = ({ view, notes }) => {
    const endOfNotes = () => {
        if (['trash', 'collection'].includes(view.type)) return null;
        return (
            <>
                <span className="nowrap">You've reached the</span>
                <span className="nowrap">end of your notes.</span>
            </>
        );
    }
    const noneFound = () => {
        if ((view.type === 'tags') && (!view.tags.length)) return null;
        if (view.type === 'collections') return "No notes found in this collection.";
        return "None found";
    }
    return (
        <ListFooter>
            {notes.length ? endOfNotes() : noneFound() }
        </ListFooter>
    );
}