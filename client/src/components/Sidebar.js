import { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import Loading from './Loading';

export default function Sidebar(props) {
    const [modalObject, setModalObject] = useState(false);
    const [showingCollections, setShowingCollections] = useState(false);
    const [showingTags, setShowingTags] = useState(false);
    const modalContent = useRef(null);
    const logout = async () => {
        const response = await fetch('/logout/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success: true response from server');
        window.location.href = `/d/${props.user.username}`;
    }
    const subList = (state, listName) => {
        const generateCollectionsList = () => {
            const createCollection = () => {
                const handleSubmit = async (e) => {
                    e.preventDefault();
                    setModalObject(content({
                        collectionNameError: '',
                        loadingIcon: true   
                    }));
                    // turn content into a function with parameter modalObjectMod, which returns the block of JSX
                    // and then here, pass modalObjectMod as parameter to that same function and return a new block
                    // and then set modalObject equal to new block
                    const collectionName = e.target[0].value;
                    const response = await fetch('/add/collection', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ username: props.user.username, collectionName })
                    });
                    const body = await response.json();
                    if (!body) return;
                    if (!body.success) {
                        setModalObject(content({
                            collectionNameError: <span className="formError">{body.collectionNameError}</span>,
                            loadingIcon: false
                        }));
                        return;
                    }
                    gracefullyCloseModal(modalContent.current);
                    props.refreshData();
                    props.updateView({ type: 'collection', name: collectionName });
                }
                const content = (breakpoints = {
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
                                    onInput={(e) => e.target.className = ''} />
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
                setModalObject(content());
            }
            if (!props.user.collections || !props.user.collections.length) return (
                <li key="createCollection"><button onClick={createCollection}><i className="fas fa-plus" style={{ marginRight: '0.3rem' }}></i> Add new</button></li>
            );
            const collectionsList = [];
            for (let i = 0; i < props.user.collections.length; i++) {
                let collectionName = props.user.collections[i];
                collectionsList.push(
                    <li key={collectionName}>
                        <button onClick={() => switchView({ type: 'collection', name: collectionName })}>{collectionName}</button>
                    </li>
                );
            }
            collectionsList.push(<li key="createCollection"><button onClick={createCollection}><i className="fas fa-plus" style={{ marginRight: '0.3rem' }}></i> Add new</button></li>);
            return collectionsList;
        }
        const generateTagsList = () => {
            const createTag = () => {
                const handleSubmit = async (e) => {
                    e.preventDefault();
                    const tagName = e.target[0].value;
                    const response = await fetch('/create/tag', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ _id: props.user._id, tagName })
                    });
                    const body = await response.json();
                    if (!body) return;
                    if (!body.success) return;
                    gracefullyCloseModal(modalContent.current);
                    props.refreshData();
                    props.updateView({ type: 'tags', tags: [tagName] });
                }
                const content = (
                    <div className="modalContent" ref={modalContent}>
                        <h2>Create a new tag</h2>
                        <form onSubmit={handleSubmit} autoComplete="off">
                            <label htmlFor="collectionName">Enter a name for your tag:</label>
                            <input type="text" name="tagName" />
                            <div className="buttons">
                                <button type="submit">Submit</button>
                                <button type="button" className="greyed" onClick={() => gracefullyCloseModal(modalContent.current)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                );
                setModalObject(content);
            }
            if (!props.user.tags || !props.user.tags.length) return (
                <li key="createTag"><button onClick={createTag}><i className="fas fa-plus" style={{ marginRight: '0.3rem' }}></i> Add new</button></li>
            );
            const tagsList = []; // type: tags, array: [currentTagArray.pushOrRemove(tagName)]
            for (let i = 0; i < props.user.tags.length; i++) {
                let tagName = props.user.tags[i];
                const handleClick = (tagName) => {
                    /* if (props.view.tags) {
                        if ((props.view.tags.indexOf(tagName) !== -1) && (props.view.tags.length === 1)) {
                            props.updateView('all-notes');
                            return;
                        }
                    }
                    const generateTagsArray = (view, tagName) => { // return an array
                        if (view.type !== 'tags') return [tagName];
                        if (view.tags.indexOf(tagName) !== -1) {
                            if (view.tags.length === 1) return [];
                            console.log(`removing tag ${tagName}`);
                            let index = view.tags.indexOf(tagName);
                            return view.tags.splice(index, 1);
                        }
                        console.log(`adding tag ${tagName}`)
                        return [...view.tags, tagName];
                    }
                    props.updateView(view => ({
                        type: 'tags',
                        tags: generateTagsArray(view, tagName)
                    })); // */
                    if (props.view.type !== 'tags') {
                        props.updateView({ type: 'tags', tags: [tagName] });
                        return;
                    }
                    if (props.view.tags === [tagName]) {
                        props.updateView('all-notes');
                        return;
                    }
                    if (props.view.tags.indexOf(tagName) !== -1) {
                        const updatedArray = (prevView) => {
                            let currentViewTags = [...prevView.tags]; // breaks otherwise
                            // console.log(currentViewTags);
                            let index = currentViewTags.indexOf(tagName);
                            //console.log(`removed ${tagName} (index ${index}: ${currentViewTags[index]}) from [${currentViewTags}]`);
                            currentViewTags.splice(index, 1);
                            return currentViewTags;
                        }
                        props.updateView(prevView => ({
                            type: 'tags',
                            tags: updatedArray(prevView)
                        }));
                        return;
                    }
                    console.log(`added ${tagName} to array`);
                    return props.updateView({
                        type: 'tags',
                        tags: [...props.view.tags, tagName]
                    });
                }
                tagsList.push(
                    <li key={tagName}>
                        <button onClick={() => handleClick(tagName)}>{tagName}</button>
                    </li>
                );
            }
            tagsList.push(<li key="createTag"><button onClick={createTag}><i className="fas fa-plus" style={{ marginRight: '0.3rem' }}></i> Add new</button></li>)
            return tagsList;
        }
        const subListContent = () => {
            switch (listName) {
                case 'collections': return generateCollectionsList();
                case 'tags': return generateTagsList();
                default: return null;
            }
        }
        return (
            <SubList show={state} user={props.user}>
                {subListContent()}
            </SubList>
        )
    }
    const gracefullyCloseModal = (modal) => {
        let container = modal.classList.contains('Modal')
            ? modal
            : modal.closest('.Modal');
        container.classList.add('goodbye');
        setTimeout(() => setModalObject(false), 200);
    }
    const switchView = (view) => {
        //setShowingTags(false);
        //setShowingCollections(false);
        props.updateView(view);
        /* if (!view.type) return props.updateView(view);
        if (view.type === 'collection') return props.updateView(view);
        if (view.type === 'tags') return props.updateView(view); // */
    }
    return (
        <div className="Sidebar">
            <Modal exitModal={gracefullyCloseModal} content={modalObject} />
            <h1>Dragonfly</h1>
            <nav>
                <ul>
                    <li><button className="notes" onClick={() => switchView('all-notes')}>All Notes</button></li>
                    <li>
                        <button className="collections" onClick={() => setShowingCollections(show => !show)}>Collections</button>
                        {subList(showingCollections, 'collections')}
                    </li>
                    <li>
                        <button className="tags" onClick={() => setShowingTags(show => !show)}>Tags</button>
                        {subList(showingTags, 'tags')}
                    </li>
                    <li><button className="starred" onClick={() => switchView('starred-notes')}>Starred</button></li>
                    <li><button className="trash">Trash</button></li>
                </ul>
            </nav>
            <nav>
                <ul>
                    <li><button className="user" onClick={() => switchView('my-account')}>My Account</button></li>
                    <li><button className="settings">Settings</button></li>
                    <li><button className="help">Help</button></li>
                    {props.user.username && <li><button className="logout" onClick={logout}>Log Out</button></li>}
                </ul>
            </nav>
        </div>
    )
}

function SubList({ show, user, children }) {
    const subList = useRef(null);
    let element = subList.current
        ? subList.current
        : null;
    useEffect(() => {
        // todo needs to also update when props.user refreshes!!!!! if u add to the list
        if (!element) return;
        if (!show) return element.style.maxHeight = '0px';
        element.style.maxHeight = element.scrollHeight+'px';
    }, [show, element, user]);
    return (
        <ul className="subList" ref={subList}>
            {children}
        </ul>
    )
}