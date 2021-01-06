import { useState, useRef, useEffect } from 'react';
import Modal from './Modal';

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
                    if (!body.success) return;
                    gracefullyCloseModal(modalContent.current);
                    props.refreshData();
                    props.updateView({ type: 'collection', name: collectionName });
                    // adjust max height of sublist as it has INCREASED!!!!!!!!!!
                }
                const content = (
                    <div className="modalContent" ref={modalContent}>
                        <h2>Create a new collection</h2>
                        <form onSubmit={handleSubmit} autoComplete="off">
                            <label htmlFor="collectionName">Enter a name for your collection:</label>
                            <input type="text" name="collectionName" />
                            <div className="buttons">
                                <button type="submit">Submit</button>
                                <button type="button" className="greyed" onClick={() => gracefullyCloseModal(modalContent.current)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                );
                setModalObject(content);
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
            const tagsList = [];
            for (let i = 0; i < props.user.tags.length; i++) {
                let tagName = props.user.tags[i];
                tagsList.push(
                    <li key={tagName}>
                        <button onClick={() => console.log('switchView({ type: tags, array: [currentTagArray.pushOrRemove(tagName)] })')}>{tagName}</button>
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
    const showModal = (content) => {
        if (!content) return;
        return (
            <Modal exitModal={gracefullyCloseModal}>
                {content}
            </Modal>
        )
    }
    const switchView = (view) => {
        //setShowingTags(false);
        //setShowingCollections(false);
        props.updateView(view);
    }
    return (
        <div className="Sidebar">
            {showModal(modalObject)}
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