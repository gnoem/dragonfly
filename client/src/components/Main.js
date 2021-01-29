import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs'; // NotePreview
import NoteEditor from './RichTextEditor';
import Loading from './Loading';
import ContextMenu from './ContextMenu';
import { elementIsInArray } from '../utils';
import Dropdown from './Dropdown';
import Tooltip from './Tooltip';

export default function Main(props) {
    const { user, view, notes, currentNote } = props;
    const modalContent = useRef(null);
    const usePrevious = (value) => {
        const ref = useRef();
        useEffect(() => {
            ref.current = value;
        });
        return ref.current;
    }
    const prevNotesCount = usePrevious(notes.length);
    useEffect(() => {
        props.updateCurrentNote(false);
    }, [view]);
    useEffect(() => {
        // what this does: when refreshData is called, update currentNote with updated note data
        // a thought for later: maybe makes sense to set currentNote to just the note _id, or call it currentNoteId, and skip having to do this
        // const currentNote = notes[getIndexFromNoteId(props.currentNoteId)] at the top of every component that would ordinarily use currentNote
        const getNoteIndexFromId = (id) => {
            return notes.findIndex(note => id === note._id);
        }
        if (!currentNote || !currentNote.content) return;
        if (prevNotesCount > notes.length) return props.updateCurrentNote(false); // after deleting/removing note and refreshing data, notes[current] is no longer defined
        props.updateCurrentNote(notes[getNoteIndexFromId(currentNote._id)]);
    // figure out if currentNote + prevNotesCount need to be listed as dependencies
    // eslint-disable-next-line
    }, [notes]);
    const createTag = (e) => {
        e.preventDefault();
        const handleSubmit = async (e) => {
            e.preventDefault();
            props.updateModalObject(content({
                tagNameError: null,
                loadingIcon: true   
            }));
            const tagName = e.target[0].value;
            const response = await fetch('/create/tag', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ _id: user._id, tagName })
            });
            const body = await response.json();
            if (!body) return;
            if (!body.success) {
                props.updateModalObject(content({
                    tagNameError: <span className="formError">{body.tagNameError}</span>,
                    loadingIcon: false
                }));
                return;
            }
            props.gracefullyCloseModal(modalContent.current);
            props.refreshData();
        }
        let content = (breakpoints = {
            tagNameError: null,
            loadingIcon: false
        }) => {
            return (
                <div className="modalContent" ref={modalContent}>
                    <h2>Create a new tag</h2>
                    <form onSubmit={handleSubmit} autoComplete="off">
                        <label htmlFor="collectionName">Enter a name for your tag:</label>
                        <input
                            type="text"
                            name="tagName"
                            className={breakpoints.tagNameError ? 'nope' : ''}
                            onInput={(e) => e.target.className = ''} />
                        {breakpoints.tagNameError}
                        {breakpoints.loadingIcon
                            ?   <div className="buttons"><Loading /></div>
                            :   <div className="buttons">
                                    <button type="submit">Submit</button>
                                    <button type="button" className="greyed" onClick={() => props.gracefullyCloseModal(modalContent.current)}>Cancel</button>
                                </div>}
                    </form>
                </div>
            )
        }
        props.updateModalObject(content());
    }
    return (
        <div className="Main" data-editor={currentNote ? true : false}>
            <Notes
                {...props}
                createTag={createTag} />
            {currentNote
                && <Editor
                    {...props}
                    createTag={createTag} />
                }
        </div>
    );
}

const isMobile = false;

function Editor(props) {
    const { currentNote, unsavedChanges } = props;
    const modalContent = useRef(null);
    useEffect(() => {
        if (!currentNote) props.updateUnsavedChanges(false);
    }, [currentNote]);
    const handleExit = () => {
        if (unsavedChanges) return props.warnUnsavedChanges();
        props.updateCurrentNote(false);
    }
    const untrashNote = async (id) => {
        const response = await fetch('/trash/note', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: id })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success: true response from server');
        props.refreshData();
    }
    const confirmPermanentDeletion = (id) => {
        const deleteNote = async (e, id) => {
            e.preventDefault();
            props.updateModalObject(content({ loadingIcon: true }));
            const response = await fetch('/delete/note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });
            const body = await response.json();
            if (!body) return console.log('no response from server');
            if (!body.success) return console.log('no success: true response from server');
            props.refreshData();
            props.gracefullyCloseModal(modalContent.current);
        }
        let content = (breakpoints = {
            loadingIcon: false
        }) => (
            <div className="modalContent" ref={modalContent}>
                <h2>Are you sure?</h2>
                You are about to permanently delete this note.
                {breakpoints.loadingIcon
                    ?   <Loading />
                    :   <form onSubmit={(e) => deleteNote(e, id)} className="buttons">
                            <button type="submit">Yes, I'm sure</button>
                            <button type="button" className="greyed" onClick={() => props.gracefullyCloseModal(modalContent.current)}>Cancel</button>
                        </form>
                    }
            </div>
        );
        props.updateModalObject(content());
    }
    return (
        <div className="Editor">
            <button className="stealth exit" onClick={handleExit}></button>
            <NoteEditor
                {...props}
                untrashNote={untrashNote}
                deleteNotePermanently={confirmPermanentDeletion} />
            {!currentNote.trash && <NoteOperations {...props} />}
        </div>
    );
}

function NoteOperations(props) {
    const { currentNote } = props;
    const [collectionsTooltip, setCollectionsTooltip] = useState(false);
    const [tagsTooltip, setTagsTooltip] = useState(false);
    const modalContent = useRef(null);
    const collectionsRef = useRef(null);
    const tagsRef = useRef(null);
    const starNote = async (e, id) => {
        // eslint-disable-next-line
        const updateUI = () => {
            if (e.currentTarget.classList.contains('hasStar')) {
                e.currentTarget.classList.remove('hasStar');
                e.currentTarget.querySelector('.tooltip').innerHTML = 'Add star';
            } else {
                e.currentTarget.classList.add('hasStar');
                e.currentTarget.querySelector('.tooltip').innerHTML = 'Unstar';
            }
        } // keeping this just in case
        // todo: if unsavedChanges, star note gets rid of save changes button? fix this
        const response = await fetch('/star/note', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: id })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success: true response from server');
        props.refreshData();
    }
    const confirmMoveToTrash = (id) => {
        const moveToTrash = async (e, id) => {
            e.preventDefault();
            props.updateModalObject(content({ loadingIcon: true }));
            const response = await fetch('/trash/note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ _id: id })
            });
            const body = await response.json();
            if (!body) return console.log('no response from server');
            if (!body.success) return console.log('no success: true response from server');
            props.refreshData();
            props.gracefullyCloseModal(modalContent.current);
        }
        let content = (breakpoints = {
            loadingIcon: false
        }) => (
            <div className="modalContent" ref={modalContent}>
                <h2>Move to Trash</h2>
                Notes moved to the Trash folder will remain there for 30 days before being automatically deleted. You can customize this option in Settings.
                {breakpoints.loadingIcon
                    ?   <Loading />
                    :   <form onSubmit={(e) => moveToTrash(e, id)} className="buttons">
                            <button type="submit">Got it</button>
                            <button type="button" className="greyed" onClick={() => props.gracefullyCloseModal(modalContent.current)}>Cancel</button>
                        </form>
                    }
            </div>
        );
        props.updateModalObject(content());
    }
    return (
        <div className="NoteOperations">
            <div className="OptionItem">
                <button className={currentNote.starred ? 'hasStar' : null} onClick={(e) => starNote(e, currentNote._id)}>
                    <i className="fas fa-star"></i>
                </button>
                <Tooltip open={false} defaultContent={currentNote.starred ? 'Unstar' : 'Add star'} />
                <div className="tooltipArrow"></div>
            </div>
            <div className="OptionItem">
                <button onClick={() => setCollectionsTooltip(true)} ref={collectionsRef}>
                    <i className="fas fa-book"></i>
                </button>
                <Tooltip
                    {...props}
                    open={collectionsTooltip}
                    defaultContent="Move to collection"
                    parent={collectionsRef.current}
                    updateTooltipOpen={setCollectionsTooltip} />
                <div className="tooltipArrow"></div> {/* used to be .tooltip::before but needs to be positioned relative to .optionItem, not .tooltip */}
            </div>
            <div className="OptionItem">
                <button onClick={() => setTagsTooltip(true)} ref={tagsRef}>
                    <i className="fas fa-tags"></i>
                </button>
                <Tooltip
                    {...props}
                    open={tagsTooltip}
                    defaultContent="Add tags"
                    parent={tagsRef.current}
                    updateTooltipOpen={setTagsTooltip} />
                <div className="tooltipArrow"></div>
            </div>
            <div className="OptionItem">
                <button onClick={() => confirmMoveToTrash(currentNote._id)}>
                    <i className="fas fa-trash"></i>
                </button>
                <Tooltip open={false} defaultContent="Move to Trash" />
                <div className="tooltipArrow"></div>
            </div>
        </div>
    );
}

function Notes(props) {
    const { user, view, notes, currentNote } = props;
    const [contextMenu, setContextMenu] = useState(false);
    const [sortTags, setSortTags] = useState('all');
    const contextMenuRef = useRef(null);
    const modalContent = useRef(null);
    const getNoteIndexFromId = (id) => {
        return notes.findIndex(note => id === note._id);
    }
    const createNewNote = () => {
        props.updateCurrentNote(true);
    }
    const trashOptions = (e) => {
        if (view !== 'trash') return;
        const { top, right } = {
            top: e.clientY - 16,
            right: (window.innerWidth - e.clientX) + 16
        }
        const confirmEmptyTrash = () => {
            setContextMenu(false);
            const emptyTrash = async () => {
                props.updateModalObject(content({ loadingIcon: true }));
                const response = await fetch('/empty/trash', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ _id: user._id })
                });
                const body = await response.json();
                if (!body) return console.log('no response from server');
                if (!body.success) return console.log('no success: true response from server');
                props.refreshData();
                props.gracefullyCloseModal(modalContent.current);
            }
            let content = (breakpoints = {
                loadingIcon: false
            }) => {
                return (
                    <div className="modalContent" ref={modalContent}>
                        <h2>Are you sure?</h2>
                        If you proceed, all the notes in your Trash will be permanently erased. This action cannot be undone.
                        {breakpoints.loadingIcon
                            ?   <Loading />
                            :   <form onSubmit={emptyTrash} className="buttons">
                                    <button type="submit">Yes, I'm sure</button>
                                    <button type="button" className="greyed" onClick={() => props.gracefullyCloseModal(modalContent.current)}>Cancel</button>
                                </form>
                        }
                    </div>
                );
            }
            props.updateModalObject(content());
        }
        let content = (
            <ul style={{ top: `${top}px`, right: `${right}px` }} ref={contextMenuRef}>
                <li><button onClick={confirmEmptyTrash}>Empty Trash</button></li>
            </ul>
        );
        setContextMenu({ name: 'presentChildren', content });
    }
    const editOrDeleteCollection = (e, collectionName) => {
        const { top, right } = {
            top: e.clientY - 16,
            right: (window.innerWidth - e.clientX) + 16
        }
        const editCollection = () => {
            setContextMenu(false);
            const handleEdit = async (e) => {
                e.preventDefault();
                props.updateModalObject(content({
                    updatedNameError: null,
                    loadingIcon: true
                }));
                const updatedName = e.target[0].value;
                const response = await fetch('/edit/collection', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        _id: user._id,
                        collectionName,
                        updatedName
                    })
                });
                const body = await response.json();
                if (!body) return console.log('no response from server');
                if (!body.success) {
                    props.updateModalObject(content({
                        updatedNameError: <span className="formError">{body.updatedNameError}</span>,
                        loadingIcon: false
                    }));
                    return;
                }
                props.refreshData();
                props.gracefullyCloseModal(modalContent.current);
                props.updateView({ type: 'collection', name: updatedName });
            }
            const initialBreakpoints = {
                updatedNameError: null,
                loadingIcon: false
            }
            let content = (breakpoints = initialBreakpoints) => {
                return (
                    <div className="modalContent" ref={modalContent}>
                        <h2>Edit collection</h2>
                        <form onSubmit={handleEdit} autoComplete="off">
                            <label htmlFor="updatedName">Edit collection name:</label>
                            <input
                                type="text"
                                name="updatedName"
                                className={breakpoints.updatedNameError ? 'nope' : ''}
                                onInput={() => props.updateModalObject(content())} />
                            {breakpoints.updatedNameError}
                            {breakpoints.loadingIcon
                                ?   <div className="buttons"><Loading /></div>
                                :   <div className="buttons">
                                        <button type="submit">Submit</button>
                                        <button type="button" className="greyed" onClick={() => props.gracefullyCloseModal(modalContent.current)}>Cancel</button>
                                    </div>
                                }
                        </form>
                    </div>
                );
            }
            props.updateModalObject(content());
        }
        const deleteCollection = () => {
            setContextMenu(false);
            const handleDelete = async (e) => {
                e.preventDefault();
                props.updateModalObject(content({ loadingIcon: true }));
                const response = await fetch('/delete/collection', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ _id: user._id, collectionName })
                });
                const body = await response.json();
                if (!body) return console.log('no response from server');
                if (!body.success) return console.log('no success: true response from server');
                props.refreshData();
                props.gracefullyCloseModal(modalContent.current);
                // switch to the one above it; if none, switch to the one below it; else all-notes
                let nextInLine = () => {
                    let thisCollectionIndex = user.collections.indexOf(collectionName);
                    let nextCollection;
                    if (user.collections[thisCollectionIndex--]) {
                        nextCollection = user.collections[thisCollectionIndex--];
                        return { type: 'collection', name: nextCollection }
                    } else if (user.collections[thisCollectionIndex++]) {
                        nextCollection = user.collections[thisCollectionIndex++];
                        return { type: 'collection', name: nextCollection }
                    } else return 'all-notes';
                }
                props.updateView(nextInLine); // */
            }
            let content = (breakpoints = {
                loadingIcon: false
            }) => (
                <div className="modalContent" ref={modalContent}>
                    <h2>Are you sure?</h2>
                    Deleting the collection "{collectionName}" won't delete any notes, only the collection itself. This action cannot be undone.
                    {breakpoints.loadingIcon
                        ?   <Loading />
                        :   <form onSubmit={handleDelete} className="buttons">
                                <button type="submit">Yes, I'm sure</button>
                                <button type="button" className="greyed" onClick={() => props.gracefullyCloseModal(modalContent.current)}>Take me back</button>
                            </form>
                        }
                </div>
            );
            // NOTE: .buttons div is a form with onSubmit={handleDelete} because for some odd reason, if I try to call handleDelete
            // from a button onClick and then setModalObject to anything, modalObject immediately gets set to false and then
            // modalContent.current gets set to null, causing an error message at props.gracefullyCloseModal(modalContent.current)
            props.updateModalObject(content());
        }
        let content = (
            <ul style={{ top: `${top}px`, right: `${right}px` }} ref={contextMenuRef}>
                <li><button onClick={editCollection}>Edit collection</button></li>
                <li><button onClick={deleteCollection}>Delete collection</button></li>
            </ul>
        );
        setContextMenu({ name: 'presentChildren', content });
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
            <div className={`Header${view === 'all-notes' || view.type === 'tags' ? '' : ' grid'}`}>
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
        if (view.type === 'collection') return <div className="endofnotes nonotes" style={{ marginTop: '1rem' }}>No notes found in this collection</div>
        return (
            <div className="endofnotes nonotes" style={{ marginTop: '1rem' }}>None found</div>
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
                updateCurrentNoteId={(id) => props.updateCurrentNote(notes[getNoteIndexFromId(id)])}
            />)
        }
        return (
            <div className="NoteExcerpts">
                {notesList}
                {generateFooter()}
            </div>
        );
    }
    const sortByTag = () => {
        let noTagsSelected = view.tags.length === 0;
        const tagList = () => {
            const newTagButton = (
                <button onClick={props.createTag} onContextMenu={(e) => e.preventDefault()} key="createTag" className="tag createTag">
                    Create new tag
                </button>
            )
            if (!user.tags.length) return newTagButton;
            const tagContextMenu = (e, tagName) => {
                e.preventDefault();
                const { top, right } = {
                    top: e.clientY,
                    right: (window.innerWidth - e.clientX)
                }
                const editTag = () => {
                    const handleEdit = async (e) => {
                        e.preventDefault();
                        props.updateModalObject(content({
                            updatedNameError: null,
                            loadingIcon: true
                        }));
                        const updatedName = e.target[0].value;
                        const response = await fetch('/edit/tag', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                _id: user._id,
                                tagName,
                                updatedName
                            })
                        });
                        const body = await response.json();
                        if (!body) return console.log('no response from server');
                        if (!body.success) {
                            props.updateModalObject(content({
                                updatedNameError: <span className="formError">{body.updatedNameError}</span>,
                                loadingIcon: false
                            }));
                            return;
                        }
                        props.refreshData();
                        props.gracefullyCloseModal(modalContent.current);
                        props.updateView({ type: 'tags', tags: [updatedName] });
                    }
                    const initialBreakpoints = {
                        updatedNameError: null,
                        loadingIcon: false
                    }
                    let content = (breakpoints = initialBreakpoints) => {
                        return (
                            <div className="modalContent" ref={modalContent}>
                                <h2>Edit tag</h2>
                                <form onSubmit={handleEdit} autoComplete="off">
                                    <label htmlFor="updatedName">Edit tag name:</label>
                                    <input
                                        type="text"
                                        name="updatedName"
                                        defaultValue={tagName}
                                        className={breakpoints.updatedNameError ? 'nope' : ''}
                                        onInput={() => props.updateModalObject(content())} />
                                    {breakpoints.updatedNameError}
                                    {breakpoints.loadingIcon
                                        ?   <div className="buttons"><Loading /></div>
                                        :   <div className="buttons">
                                                <button type="submit">Submit</button>
                                                <button type="button" className="greyed" onClick={() => props.gracefullyCloseModal(modalContent.current)}>Cancel</button>
                                            </div>}
                                </form>
                            </div>
                        );
                    }
                    props.updateModalObject(content());
                }
                const confirmDeleteTag = () => {
                    const deleteTag = async () => {
                        props.updateModalObject(content({ loadingIcon: true }));
                        const response = await fetch('/delete/tag', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ _id: user._id, tagName })
                        });
                        const body = await response.json();
                        if (!body) return console.log('no response from server');
                        if (!body.success) return console.log('no success: true response from server');
                        toggleTag(tagName);
                        props.refreshData();
                        props.gracefullyCloseModal(modalContent.current);
                    }
                    let content = (breakpoints = {
                        loadingIcon: false
                    }) => (
                        <div className="modalContent" ref={modalContent}>
                            <h2>Are you sure?</h2>
                            Deleting the tag "{tagName}" won't delete any notes, only the tag itself. This action cannot be undone.
                            {breakpoints.loadingIcon
                                ?   <Loading />
                                :   <form onSubmit={deleteTag} className="buttons">
                                        <button type="submit">Yes, I'm sure</button>
                                        <button type="button" className="greyed" onClick={() => props.gracefullyCloseModal(modalContent.current)}>Cancel</button>
                                    </form>
                                }
                        </div>
                    );
                    props.updateModalObject(content());
                }
                let content = (
                    <ul onClick={() => setContextMenu(false)} className="smol" style={{ top: `${top}px`, right: `${right}px` }} ref={contextMenuRef}>
                        <li><button className="edit" onClick={editTag}>Edit tag</button></li>
                        <li><button className="delete" onClick={confirmDeleteTag}>Delete tag</button></li>
                    </ul>
                )
                setContextMenu({ name: 'presentChildren', content });
            }
            const toggleTag = (tagName) => {
                const updatedArray = (prevView) => {
                    let currentViewTags = [...prevView.tags];
                    if (!elementIsInArray(tagName, currentViewTags)) {
                        currentViewTags.push(tagName);
                        return currentViewTags;
                    }
                    let index = currentViewTags.indexOf(tagName);
                    currentViewTags.splice(index, 1);
                    return currentViewTags;
                }
                props.updateView(prevView => ({
                    type: 'tags',
                    tags: updatedArray(prevView),
                    sortTags
                }));
                return;
            }
            let tagArray = [];
            for (let i = 0; i < user.tags.length; i++) {
                let thisTag = user.tags[i];
                let isSelected = elementIsInArray(thisTag, view.tags);
                tagArray.push(
                    <button
                      onClick={() => toggleTag(thisTag)}
                      onContextMenu={(e) => tagContextMenu(e, thisTag)}
                      key={`showingTag-${thisTag}`}
                      className={`tag${isSelected ? ' hasTag' : ''}`}>
                        {thisTag}
                    </button>
                );
            }
            tagArray.push(newTagButton);
            return tagArray;
        }
        const updateSortTags = (value) => {
            setSortTags(value);
            props.updateView(prevView => ({ ...prevView, sortTags: value }));
        }
        return (
            <div className="sortByTag">
                <span className="hint">Right-click on a tag for more options.</span>
                <h2>{noTagsSelected ? 'View' : 'Viewing'} notes tagged:</h2>
                <div className="tagsGrid">{tagList()}</div>
                <div className="sortTagOptions">
                    Find notes with
                        <Dropdown display={sortTags}>
                            <li><button onClick={() => updateSortTags('all')}>all</button></li>
                            <li><button onClick={() => updateSortTags('any')}>any</button></li>
                        </Dropdown>
                    of the selected tags.
                </div>
            </div>
        );
    }
    return (
        <div className="Notes">
            {contextMenu && <ContextMenu menu={contextMenu} updateMiniMenu={setContextMenu} />}
            {generateHeader()}
            {(view.type === 'tags') && sortByTag()}
            {generateNotesList()}
        </div>
    );
}

function NotePreview(props) {
    let { _id, title, content, starred, createdAt, lastModified } = props;
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
        props.updateCurrentNoteId(_id);
    }
    return (
        <div className="NoteExcerpt" onClick={handleClick}>
            <div className="title"><h2>{noteTitle()}</h2>{isStarred()}</div>
            {noteExcerpt(content)}
            {dateInfo()}
        </div>
    );
}