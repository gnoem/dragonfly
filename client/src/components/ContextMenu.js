import { useEffect, useRef } from 'react';
import { elementHasParent, elementIsInArray } from '../utils';
import Dropdown from './Dropdown';
import Loading from './Loading';

export default function ContextMenu(props) {
    const { menu, updateMiniMenu } = props;
    switch (menu.name) {
        case 'moveNoteToCollection': return <MoveNoteToCollection {...props} />;
        case 'tagNote': return <TagNote {...props} />;
        case 'presentChildren': return <PresentChildren content={menu.content} updateMiniMenu={updateMiniMenu} />;
        default: return null;
    }
}

export function MiniMenu({ exitMenu, children }) {
    const menuBox = useRef(null);
    useEffect(() => {
        if (!children) return;
        const closeMenu = (e) => {
            if (elementHasParent(e.target, '#demo')) return; // todo dev only
            if (elementHasParent(e.target, '.MiniMenu ul')) return;
            if (elementHasParent(e.target, '.Modal')) return; // specifically so that collections minimenu doesn't disappear when creating new collection
            exitMenu();
        }
        console.log('added event listener');
        window.addEventListener('click', closeMenu);
        return () => {
            console.log('rmoved listener');
            window.removeEventListener('click', closeMenu);
        }
    }, [exitMenu, children]);
    if (!children) return null;
    return (
        <div className="MiniMenu" ref={menuBox}>
            {children}
        </div>
    )
}

export function MoveNoteToCollection({ menu, user, currentNote, updateMiniMenu, updateModalObject, gracefullyCloseModal, refreshData }) {
    const modalContent = useRef(null);
    const miniMenuRef = useRef(null);
    if (!menu || !menu.position) return null;
    const moveToCollection = async (e, collectionName) => {
        let clickedButton = e.target;
        const handleMove = async (collectionName) => {
            let removingFromCollection = modalContent.current;
            if (removingFromCollection) updateModalObject(content({ loadingIcon: true }));
            const response = await fetch('/categorize/note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ _id: currentNote._id, collectionName })
            });
            const body = await response.json();
            if (!body) return console.log('no response from server');
            if (!body.success) return console.log('no success: true response from server');
            refreshData();
            if (removingFromCollection) {
                clickedButton.classList.remove('hasCollection');
                gracefullyCloseModal(modalContent.current);
            } else {
                // immediately update button with check mark and remove check mark on old collection
                if (miniMenuRef.current) {
                    const prevCollection = miniMenuRef.current.querySelector('.hasCollection');
                    if (prevCollection) prevCollection.classList.remove('hasCollection');   
                }
                clickedButton.classList.add('hasCollection');
            }
        }
        if (!clickedButton.classList.contains('hasCollection')) return handleMove(collectionName);
        let content = (breakpoints = {
            loadingIcon: false
        }) => {
            return (
                <div className="modalContent" ref={modalContent}>
                    <h2>Remove from collection</h2>
                    Are you sure you want to remove this note from the collection "{collectionName}"?
                    {breakpoints.loadingIcon
                        ?   <Loading />
                        :   <div className="buttons">
                                <button onClick={() => handleMove(false)}>Yes, I'm sure</button>
                                <button className="greyed" onClick={() => gracefullyCloseModal(modalContent.current)}>Take me back</button>
                            </div>
                        }
                </div>
            );
        }
        updateModalObject(content());
    }
    const createCollection = () => {
        const handleSubmit = async (event) => {
            event.preventDefault();
            updateModalObject(content({
                collectionNameError: null,
                loadingIcon: true   
            }));
            const collectionName = event.target[0].value;
            const response = await fetch('/add/collection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: user.username, collectionName })
            });
            const body = await response.json();
            if (!body) return console.log('no response from server');
            if (!body.success) {
                updateModalObject(content({
                    collectionNameError: <span className="formError">{body.collectionNameError}</span>,
                    loadingIcon: false
                }));
                return;
            }
            gracefullyCloseModal(modalContent.current);
            refreshData();
        }
        let content = (breakpoints = {
            collectionNameError: null,
            loadingIcon: false
        }) => { // todo better name / possible places for error message or similar to appear in this modal
            return (
                <div className="modalContent" ref={modalContent}>
                    <h2>Create a new collection</h2>
                    <form onSubmit={handleSubmit} autoComplete="off">
                        <label htmlFor="collectionName">Enter a name for your collection:</label>
                        <input
                            type="text"
                            name="collectionName"
                            className={breakpoints.collectionNameError ? 'nope' : ''}
                            onInput={() => updateModalObject(content())} />
                        {breakpoints.collectionNameError}
                        {breakpoints.loadingIcon
                            ?   <div className="buttons"><Loading /></div>
                            :   <div className="buttons">
                                    <button type="submit">Submit</button>
                                    <button type="button" className="greyed" onClick={() => gracefullyCloseModal(modalContent.current)}>Cancel</button>
                                </div>}
                    </form>
                </div>
            );
        }
        updateModalObject(content());
    }
    const collectionsList = (collections) => {
        const createNewCollectionButton = (
            <li key={`createNewCollection-MiniMenu`}>
                    <button onClick={() => createCollection()}>
                        <i className="fas fa-plus-circle"></i> Create new
                    </button>
                </li>
        );
        if (!collections || !collections.length) return <Dropdown>{createNewCollectionButton}</Dropdown>;
        let array = [];
        let selected;
        for (let i = 0; i < collections.length; i++) {
            let noteIsInCollection = currentNote.collection === collections[i];
            if (noteIsInCollection) selected = collections[i];
            array.push(
                <li key={`collectionsMiniMenu-${collections[i]}`}>
                    <button
                        className={`add${noteIsInCollection ? ' hasCollection' : ''}`}
                        onClick={(e) => moveToCollection(e, collections[i])}>
                        {collections[i]}
                    </button>
                </li>
            );
        }
        array.push(createNewCollectionButton);
        return (
            <Dropdown display={selected}>
                {array}
            </Dropdown>
        )
    }
    return (
        <MiniMenu exitMenu={() => updateMiniMenu(false)}>
            <ul style={{ top: `${menu.position.top}px`, right: `${menu.position.right}px` }} ref={miniMenuRef}>
                <li><strong>Move to collection</strong></li>
                {collectionsList(user.collections)}
            </ul>
        </MiniMenu>
    )
}

export function TagNote({ menu, user, currentNote, createTag, updateMiniMenu, updateModalObject, gracefullyCloseModal, refreshData }) {
    const miniMenuRef = useRef(null);
    if (!menu || !menu.position) return null;
    const handleTagNote = async (e, tagName) => {
        const response = await fetch('/tag/note', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: currentNote._id, tagName })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success: true response from server');
        const button = e.target;
        if (!button.classList.contains('hasTag')) button.classList.add('hasTag');
        else button.classList.remove('hasTag');
        refreshData();
    }
    const tagsList = (tags) => {
        const createNewTag = (
            <li key={`minimenu-user.collections-createNewTag`} className="tagsList">
                <button className="tag createTag" onClick={(e) => createTag(e, true)}>
                    Create new
                </button>
            </li>
        );
        if (!tags) return createNewTag;
        let userTags = [];
        for (let i = 0; i < tags.length; i++) {
            let tagName = tags[i];
            const hasTag = (elementIsInArray(tagName, currentNote.tags)) ? ' hasTag' : '';
            userTags.push(
                <li key={`minimenu-user.tags-${tagName}`} className="tagsList">
                    <button className={`tag${hasTag}`} onClick={(e) => handleTagNote(e, tagName)}>
                        {tagName}
                    </button>
                </li>
            );
        }
        userTags.push(createNewTag);
        return userTags;
    }
    return (
        <MiniMenu exitMenu={() => updateMiniMenu(false)}>
            <ul className="nolines" style={{ top: `${menu.position.top}px`, right: `${menu.position.right}px` }} ref={miniMenuRef}>
                <li><strong>Add tags</strong></li>
                {tagsList(user.tags)}
            </ul>
        </MiniMenu>
    )
}

export function PresentChildren({ content, updateMiniMenu }) {
    return (
        <MiniMenu exitMenu={() => updateMiniMenu(false)}>
            {content}
        </MiniMenu>
    )
}