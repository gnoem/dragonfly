import Dropdown from '../../Dropdown';
import { NotePreview } from './NotePreview';

export const List = (props) => {
    const { view } = props;
    return (
        <div className="Notes">
            <ListHeader {...props} />
            {view.type === 'tags' && <SortTags {...props} />}
            <ListContent {...props} />
        </div>
    );
}

const ListHeader = (props) => {
    const { view, isMobile } = props;
    let title, button = '', className = 'Header';
    const createNewNote = () => {};
    const editOrDeleteCollection = () => {};
    const trashOptions = () => {};
    switch (view.type) {
        case 'all-notes': {
            title = <h2>All notes</h2>;
            if (isMobile) button = (
                <button onClick={createNewNote}>
                    <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i> Create new
                </button>
            ); else button = (
                <button className="createNew" onClick={createNewNote}>
                    <span className="tooltip">Create a new note</span>
                </button>
            );
            break;
        }
        case 'starred-notes': {
            className = 'Header grid';
            title = <h2>Starred notes</h2>;
            break;
        }
        case 'trash': {
            className = 'Header grid';
            title = <h2>Trash</h2>;
            button = (
                <button className="menu viewOptions" onClick={(e) => trashOptions(e)}>
                    <i className="fas fa-bars"></i>
                </button>
            );
            break;
        }
        case 'collection': {
            className = 'Header grid';
            title = (
                <span className="collectionHeader">
                    <span>COLLECTION</span>
                    <span>{view.name}</span>
                </span>
            );
            button = (
                <button className="menu viewOptions" onClick={(e) => editOrDeleteCollection(e, view.name)}>
                    <i className="fas fa-bars"></i>
                </button>
            );
            break;
        }
        case 'tags': {
            title = '';
            button = '';
            break;
        }
        default: {
            title = <h2>All notes</h2>;
            if (isMobile) button = (
                <button onClick={createNewNote}>
                    <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i> Create new
                </button>
            ); else button = (
                <button className="createNew" onClick={createNewNote}>
                    <span className="tooltip">Create a new note</span>
                </button>
            );
            break;
        }
    }
    return (
        <div className={className}>
            <h1>Dragonfly</h1>
            {title}
            {button}
        </div>
    );
}

const ListFooter = (props) => {
    const { notes, view } = props;
    if (notes.length) return (
        <div className="endofnotes">
            <span className="nowrap">You've reached the</span>
            <span className="nowrap">end of your notes.</span>
        </div>
    )
    if (view.type === 'all-notes') return null;
    if ((view.type === 'tags') && (!view.tags.length)) return null;
    if (view.type === 'collection') return <div className="endofnotes nonotes" style={{ marginTop: '1rem' }}>No notes found in this collection</div>
    return (
        <div className="endofnotes nonotes" style={{ marginTop: '1rem' }}>None found</div>
    );
}

const ListContent = (props) => {
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
        <div className="NoteExcerpts">
            {notesList()}
            <ListFooter {...props} />
        </div>
    );
}

const SortTags = (props) => {
    const { view } = props;
    let noTagsSelected = view.tags.length === 0;
    const listOfTags = () => {
        return 'nothing yet';
    }
    const updateSortTags = (value) => {
        props.updateView(prevView => ({
            ...prevView,
            sortTags: value
        }));
    }
    return (
        <div className="sortByTag">
            <span className="hint">Right-click on a tag for more options.</span>
            <h2>{noTagsSelected ? 'View' : 'Viewing'} notes tagged:</h2>
            <div className="tagsGrid">{listOfTags()}</div>
            <div className="sortTagOptions">
                Find notes with
                    <Dropdown display={view.sortTags || 'all'}>
                        <li><button onClick={() => updateSortTags('all')}>all</button></li>
                        <li><button onClick={() => updateSortTags('any')}>any</button></li>
                    </Dropdown>
                of the selected tags.
            </div>
        </div>
    );
}