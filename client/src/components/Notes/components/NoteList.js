import { List, ListHeader, ListContent, ListFooter } from '../../List';
import { NotePreview } from './NotePreview';

export const NoteList = (props) => {
    return (
        <List>
            <NoteListHeader {...props} />
            <NoteListContent {...props} />
        </List>
    );
}

const NoteListHeader = (props) => {
    const { view, isMobile } = props;
    const buttonShouldInherit = {
        type: view.type,
        isMobile
    }
    switch (view.type) {
        case 'all-notes': return (
            <ListHeader title="All notes">
                <HeaderButton {...buttonShouldInherit} />
            </ListHeader>
        );
        case 'starred-notes': return (
            <ListHeader title="Starred notes" />
        );
        case 'trash': return (
            <ListHeader
                title="Trash"
                button={<HeaderButton {...buttonShouldInherit} />}
                grid={true} />
        );
        case 'collection': return (
            <ListHeader
                title={<CollectionTitle name={view.collection.name} />}
                button={<HeaderButton {...buttonShouldInherit} />}
                grid={true} />
        );
        case 'tags': return (
            <ListHeader>
                <SortByTag />
            </ListHeader>
        );
        default: return null;
    }
}

const HeaderButton = (props) => {
    const { type, isMobile } = props;
    switch (type) {
        case 'all-notes': {
            if (isMobile) return (
                <button>
                    <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i> Create new
                </button>
            ); else return (
                <button className="createNew">
                    <span className="tooltip">Create a new note</span>
                </button>
            );
        }
        case 'trash': {
            return (
                <button className="icon bar-menu round-basic"></button>
            );
        }
        case 'collection': {
            return (
                <button className="icon bar-menu round-basic"></button>
            );
        }
        default: return null;
    }
}

const CollectionTitle = ({ name }) => {
    return (
        <span className="collectionHeader">
            <span>COLLECTION</span>
            <span>{name}</span>
        </span>
    );
}

const SortByTag = () => {
    return (
        <div>sort by tag</div>
    );
}

const NoteListContent = (props) => {
    const { notes } = props;
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
        <ListContent footer={<NoteListFooter {...props} />}>
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