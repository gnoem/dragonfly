import { useState, useEffect } from 'react';
import dayjs from 'dayjs'; // NotePreview
import NoteEditor from './RichTextEditor';

export default function Main(props) {
    const { view } = props;
    const [viewingEditor, setViewingEditor] = useState(false);
    const [currentNote, setCurrentNote] = useState(false);
    useEffect(() => {
        setCurrentNote(false);
        setViewingEditor(false);
    }, [view]);
    return (
        <div className="Main" data-editor={viewingEditor}>
            <Notes
                {...props}
                currentNote={currentNote}
                updateCurrentNote={setCurrentNote}
                updateViewingEditor={setViewingEditor} />
            {viewingEditor
                && <Editor
                    {...props}
                    currentNote={currentNote}
                    updateViewingEditor={setViewingEditor} />
                }
        </div>
    );
}

const isMobile = false;

function Editor(props) {
    const { user, currentNote, updateViewingEditor } = props;
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const handleExit = () => {
        if (unsavedChanges) console.log('warning');
        updateViewingEditor(false);
    }
    return (
        <div className="Editor">
            <button className="stealth exit" onClick={handleExit}></button>
            <NoteEditor
                {...props}
                user={user}
                currentNote={currentNote}
                unsavedChanges={unsavedChanges}
                updateUnsavedChanges={setUnsavedChanges} />
            {!currentNote.trash && <NoteOperations {...props} currentNote={currentNote} />}
        </div>
    );
}

function NoteOperations({ currentNote }) {
    const starNote = () => {

    }
    const updateMiniMenu = () => {
        
    }
    const confirmMoveToTrash = () => {
        
    }
    return (
        <div className="NoteOperations">
            <div className="OptionItem">
                <button className={currentNote.starred ? 'hasStar' : null} onClick={() => starNote(currentNote._id)}>
                    <i className="fas fa-star"></i>
                    <span className="tooltip">{currentNote.starred ? 'Unstar' : 'Add star'}</span>
                </button>
            </div>
            <div className="OptionItem">
                <button onClick={(e) => updateMiniMenu(e, 'moveNoteToCollection')}>
                    <i className="fas fa-book"></i>
                    <span className="tooltip">Move to collection</span>
                </button>
            </div>
            <div className="OptionItem">
                <button onClick={(e) => updateMiniMenu(e, 'tagNote')}>
                    <i className="fas fa-tags"></i>
                    <span className="tooltip">Add tags</span>
                </button>
            </div>
            <div className="OptionItem">
                <button onClick={() => confirmMoveToTrash(currentNote._id)}>
                    <i className="fas fa-trash"></i>
                    <span className="tooltip">Move to Trash</span>
                </button>
            </div>
        </div>
    )
}

function Notes({ view, notes, currentNote, updateCurrentNote, updateViewingEditor }) {
    const getNoteIndexFromId = (id) => {
        return notes.findIndex(note => id === note._id);
    }
    const createNewNote = () => {

    }
    const trashOptions = () => {

    }
    const editOrDeleteCollection = () => {

    }
    const generateHeader = () => {
        let title, button = '';
        switch (view) {
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
                title = <h2>Starred notes</h2>;
                break;
            }
            case 'trash': {
                title = <h2>Trash</h2>;
                button = (
                    <button className="menu viewOptions" onClick={(e) => trashOptions(e)}>
                        <i className="fas fa-bars"></i>
                    </button>
                );
                break;
            }
            default: {
                if (view.type === 'collection') {
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
                } else if (view.type === 'tags') {
                    title = '';
                    button = '';
                } else {
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
                }
                break;
            }
        }
        return (
            <div className={`Header${view === 'all-notes' ? '' : ' grid'}`}>
                <h1>Dragonfly</h1>
                {title}
                {button}
            </div>
        );
    }
    const generateFooter = () => {
        if (notes.length) return (
            <div className="endofnotes">
                <span className="nowrap">You've reached the</span>
                <span className="nowrap">end of your notes.</span>
            </div>
        )
        if (view === 'all-notes') return null;
        if ((view.type === 'tags') && (!view.tags.length)) return null;
        return (
            <div className="endofnotes" style={{ marginTop: '1rem' }}>None found</div>
        );
    }
    const generateNotesList = () => {
        let notesList = [];
        for (let i = 0; i < notes.length; i++) {
            notesList.push(<NotePreview
                key={notes[i]._id}
                current={currentNote?._id}
                temp={false}
                {...notes[i]}
                updateCurrentNoteId={(id) => updateCurrentNote(notes[getNoteIndexFromId(id)])}
                updateViewingEditor={updateViewingEditor}
            />)
        }
        return (
            <div className="NoteExcerpts">
                {notesList}
                {generateFooter()}
            </div>
        );
    }
    return (
        <div className="Notes">
            {generateHeader()}
            {generateNotesList()}
        </div>
    );
}

function NotePreview(props) {
    let { _id, title, content, starred, createdAt, lastModified, updateCurrentNoteId, updateViewingEditor } = props;
    const noteExcerpt = (content) => {
        const getExcerpt = (content) => {
            const num = 115;
            let textContent = content.blocks[0].text.length < num
                ? content.blocks[0].text
                : content.blocks[0].text.substr(0, num) + '...';
            return <span className="excerpt">{textContent}</span>;
        }
        return getExcerpt(content);
    }
    const noteTitle = () => {
        if (!title) return `Note from ${dayjs(createdAt).format('MM/DD/YYYY')}`;
        return title;
    }
    const isCurrent = (id) => {
        if (id === props.current) return ' current';
        else return '';
    }
    const isStarred = () => {
        if (starred) return <div className="hasStar"><i className="fas fa-star"></i></div>;
    }
    const dateInfo = () => {
        const untouched = createdAt === lastModified;
        let createdAtMMDDYYYY = dayjs(createdAt).format('MM/DD/YYYY');
        let lastModifiedMMDDYYYY = dayjs(lastModified).format('MM/DD/YYYY');
        createdAt = (createdAtMMDDYYYY === dayjs().format('MM/DD/YYYY'))
            ? dayjs(createdAt).format('h:mm a')
            : createdAtMMDDYYYY;
        lastModified = (lastModifiedMMDDYYYY === dayjs().format('MM/DD/YYYY'))
            ? dayjs(lastModified).format('h:mm a')
            : lastModifiedMMDDYYYY;
        const created = `Created ${createdAt}`;
        const modified = `• Last modified ${lastModified}`;
        return (
            <span className="meta">{created} {!untouched && modified}</span>
        );
    }
    const handleClick = () => {
        updateCurrentNoteId(_id);
        updateViewingEditor(true);
    }
    return (
        <div className={`NoteExcerpt${isCurrent(_id)}`} onClick={handleClick}>
            <div className="title"><h2>{noteTitle()}</h2>{isStarred()}</div>
            {noteExcerpt(content)}
            {dateInfo()}
        </div>
    );
}