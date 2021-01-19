import { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import Loading from './Loading';

export default function Nav({ user, exitMenu, refreshData, updateView }) {
    const [modalObject, setModalObject] = useState(false);
    const [showingCollections, setShowingCollections] = useState(false);
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
        window.location.href = `/d/${user.username}`;
    }
    const subList = (state, listName) => {
        const generateCollectionsList = () => {
            const createCollection = () => {
                const handleSubmit = async (e) => {
                    e.preventDefault();
                    setModalObject(content({
                        collectionNameError: null, // null or empty string?
                        loadingIcon: true   
                    }));
                    const collectionName = e.target[0].value;
                    const response = await fetch('/create/collection', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ _id: user._id, collectionName })
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
                    refreshData();
                    updateView({ type: 'collection', name: collectionName });
                }
                const initialBreakpoints = {
                    collectionNameError: null,
                    loadingIcon: false
                }
                let content = (breakpoints = initialBreakpoints) => { // todo better name / possible places for error message or similar to appear in this modal
                    return (
                        <div className="modalContent" ref={modalContent}>
                            <h2>Create a new collection</h2>
                            <form onSubmit={handleSubmit} autoComplete="off">
                                <label htmlFor="collectionName">Enter a name for your collection:</label>
                                <input
                                    type="text"
                                    name="collectionName"
                                    className={breakpoints.collectionNameError ? 'nope' : ''}
                                    onInput={() => setModalObject(content())} />
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
            if (!user.collections || !user.collections.length) return (
                <li key="createCollection"><button onClick={createCollection}><i className="fas fa-plus" style={{ marginRight: '0.3rem' }}></i> Add new</button></li>
            );
            const collectionsList = [];
            for (let i = 0; i < user.collections.length; i++) {
                let collectionName = user.collections[i];
                collectionsList.push(
                    <li key={collectionName}>
                        <button onClick={() => switchView({ type: 'collection', name: collectionName })}>{collectionName}</button>
                    </li>
                );
            }
            collectionsList.push(<li key="createCollection"><button onClick={createCollection}><i className="fas fa-plus" style={{ marginRight: '0.3rem' }}></i> Add new</button></li>);
            return (
                <SubList show={state} user={user}>
                    {collectionsList}
                </SubList>
            )
        }
        switch (listName) {
            case 'collections': return generateCollectionsList();
            default: return null;
        }
    }
    const gracefullyCloseModal = (modal) => {
        let container = modal.classList.contains('Modal')
            ? modal
            : modal.closest('.Modal');
        container.classList.add('goodbye');
        setTimeout(() => setModalObject(false), 200);
    }
    const switchView = (view) => {
        if (exitMenu) exitMenu();
        updateView(view);
    }
    return (
        <div className="Nav">
            <Modal exitModal={gracefullyCloseModal} content={modalObject} />
            <nav>
                <ul>
                    <li><button className="notes" onClick={() => switchView('all-notes')}>All Notes</button></li>
                    <li>
                        <button className="collections" onClick={() => setShowingCollections(show => !show)}>Collections</button>
                        {subList(showingCollections, 'collections')}
                    </li>
                    <li><button className="tags" onClick={() => switchView({ type: 'tags', tags: [] })}>Tags</button></li>
                    <li><button className="starred" onClick={() => switchView('starred-notes')}>Starred</button></li>
                    <li><button className="trash" onClick={() => switchView('trash')}>Trash</button></li>
                </ul>
            </nav>
            <nav>
                <ul>
                    <li><button className="user" onClick={() => switchView('my-account')}>My Account</button></li>
                    <li><button className="settings">Settings</button></li>
                    <li><button className="help">Help</button></li>
                    {user.username && <li><button className="logout" onClick={logout}>Log Out</button></li>}
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
        // todo needs to also update when user refreshes!!!!! if u add to the list
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