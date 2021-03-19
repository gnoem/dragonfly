import { useState } from 'react';
import { List, ListHeader, ListHeaderButton, ListContent, ListFooter } from '../../List';
import { NotePreview } from './NotePreview';
import { SortByTag } from '../../Tags';
import { MiniMenu } from '../../MiniMenu';
import { Modal } from '../../Modal';

export const NoteList = (props) => {
    const { notes } = props;
    if (!notes) return null;
    return (
        <List>
            <NoteListHeader {...props} />
            <NoteListContent {...props} />
        </List>
    );
}

const NoteListHeader = (props) => {
    const { view } = props;
    switch (view.type) {
        case 'all-notes': return (
            <ListHeader title="All notes">
                <NewNoteButton {...props} />
            </ListHeader>
        );
        case 'starred-notes': return (
            <ListHeader title="Starred notes" />
        );
        case 'trash': return (
            <ListHeader
                title="Trash"
                button={<TrashMenuButton {...props} />}
                grid={true} />
        );
        case 'collection': return (
            <ListHeader
                title={<CollectionTitle name={view.collection.name} />}
                button={<CollectionMenuButton {...props} collection={view.collection} />}
                grid={true} />
        );
        case 'tags': return (
            <ListHeader>
                <SortByTag {...props} />
            </ListHeader>
        );
        default: return null;
    }
}

const NewNoteButton = (props) => {
    const newNote = () => props.updateView(prevView => ({ ...prevView, currentNote: true }));
    return (
        <ListHeaderButton>
            <button className="createNew" onClick={newNote}>
                <span className="tooltip">Create a new note</span>
            </button>
        </ListHeaderButton>
    );
}

const TrashMenuButton = (props) => {
    const { user, notes } = props;
    const [showingMenu, setShowingMenu] = useState(false);
    const trashIsEmpty = (word) => (
        <div>
            <h2>Your Trash is empty</h2>
            No notes here to {word ?? 'select'}!
            <div className="buttons">
                <button type="button" className="gryed" onClick={props.gracefullyCloseModal}>Close</button>
            </div>
        </div>
    );
    const formData = { _id: user._id, onSuccess: props.refreshData };
    const restoreAll = () => {
        if (notes.length) props.updateModal('restoreTrash', 'form', formData);
        else props.updateModal(trashIsEmpty('restore'));
    }
    const emptyTrash = () => {
        if (notes.length) props.updateModal('emptyTrash', 'form', formData);
        else props.updateModal(trashIsEmpty('delete'));
    }
    const menuItems = [{ label: 'Restore all', onClick: restoreAll }, { label: 'Empty Trash', onClick: emptyTrash }];
    return (
        <ListHeaderButton>
            <button onClick={() => setShowingMenu(true)} className="icon bar-menu round-basic"></button>
            <MiniMenu show={showingMenu} updateShow={setShowingMenu} menuItems={menuItems} />
        </ListHeaderButton>
    );
}

const CollectionMenuButton = (props) => {
    const { _id, name } = props.collection;
    const [showingMenu, setShowingMenu] = useState(false);
    const onSuccessDelete = () => {
        props.refreshData();
        props.updateView({ type: 'collections' });
    }
    const editCollection = () => props.updateModal('editCollection', 'form', { _id, name, onSuccess: props.refreshData });
    const deleteCollection = () => props.updateModal('deleteCollection', 'form', { _id, name, onSuccess: onSuccessDelete });
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

const NoteListContent = (props) => {
    const { notes, view } = props;
    const notesList = () => {
        return notes.map(note => (
            <NotePreview
                key={`NotePreview-${note._id}`}
                {...note}
                onClick={() => props.updateCurrentNote(note)}
            />
        ));
    }
    return (
        <ListContent className={(view.type === 'collection') && 'slideUpIn'} footer={<NoteListFooter {...props} />}>
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