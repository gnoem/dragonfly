import { useState, useEffect, useRef } from 'react';
import Loading from '../Loading';
import Dropdown from '../Dropdown';
import { elementHasParent, elementIsInArray } from '../../utils';

export default function Tooltip(props) {
    const { user, currentNote, open, defaultContent, parent } = props;
    const [tooltipContent, setTooltipContent] = useState(open || defaultContent);
    const tooltip = useRef(null);
    useEffect(() => {
        if (!tooltip || !tooltip.current) return;
        if (!open || !parent) return; // button hasn't been clicked
        setTooltipContent(() => {
            switch (defaultContent) {
                case 'Move to collection': return <MoveNoteToCollection {...props} />;
                case 'Add tags': return <TagNote {...props} />;
                default: return null;
            }
        });
        const closeTooltip = (e) => {
            if (parent.contains(e.target)) return;
            if (!tooltip.current) return;
            if (tooltip.current.contains(e.target)) return;
            if (elementHasParent(e.target, '.Modal')) return;
            setTooltipContent(defaultContent);
            props.updateTooltipOpen(false);
            if (tooltip.current) tooltip.current.style.maxHeight = '2rem';
        }
        window.addEventListener('click', closeTooltip);
        return () => window.removeEventListener('click', closeTooltip);
    }, [open, user, currentNote]);
    useEffect(() => {
        if (tooltipContent === defaultContent) return;
        const expandTooltip = (tooltip) => {
            tooltip.style.maxHeight = (tooltip.scrollHeight < 300)
                ? tooltip.scrollHeight+'px'
                : '300px';
        }
        expandTooltip(tooltip.current);
    }, [tooltipContent])
    return (
        <div className={`tooltip${open ? ' menu' : ''}${defaultContent === 'Move to collection' ? ' hasDropdown' : ''}`} ref={tooltip}>
            {tooltipContent}
        </div>
    );
}

function MoveNoteToCollection(props) {
    const { user, currentNote } = props;
    const modalContent = useRef(null);
    const moveToCollection = async (e, collectionName) => {
        let clickedButton = e.target;
        const handleMove = async (collectionName) => {
            let removingFromCollection = modalContent.current;
            if (removingFromCollection) props.updateModalObject(content({ loadingIcon: true }));
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
            props.refreshData();
            if (removingFromCollection) {
                clickedButton.classList.remove('hasCollection');
                props.gracefullyCloseModal(modalContent.current);
            } else {
                clickedButton.closest('.Dropdown').querySelector('.hasCollection').classList.remove('hasCollection');
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
                                <button onClick={() => handleMove('')}>Yes, I'm sure</button>
                                <button className="greyed" onClick={() => props.gracefullyCloseModal(modalContent.current)}>Take me back</button>
                            </div>
                        }
                </div>
            );
        }
        props.updateModalObject(content());
    }
    const createCollection = () => {
        const handleSubmit = async (e) => {
            e.preventDefault();
            props.updateModalObject(content({
                collectionNameError: null,
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
            if (!body) return console.log('no response from server');
            if (!body.success) {
                props.updateModalObject(content({
                    collectionNameError: <span className="formError">{body.collectionNameError}</span>,
                    loadingIcon: false
                }));
                return;
            }
            props.gracefullyCloseModal(modalContent.current);
            props.refreshData();
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
                            onInput={() => props.updateModalObject(content())} />
                        {breakpoints.collectionNameError}
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
    const collectionsList = (collections) => {
        const createNewCollectionButton = (
            <li key={`createNewCollection-MiniMenu`}>
                <button onClick={() => createCollection()} className="keepOpen">
                    <i className="fas fa-plus-circle" style={{ marginRight: '0.2rem' }}></i> Create new
                </button>
            </li>
        );
        if (!collections || !collections.length) return <Dropdown>{createNewCollectionButton}</Dropdown>;
        let array = [];
        for (let i = 0; i < collections.length; i++) {
            let noteIsInCollection = currentNote.collection === collections[i];
            array.push(
                <li key={`collectionsMiniMenu-${collections[i]}`}>
                    <button
                        className={`add${noteIsInCollection ? ' hasCollection keepOpen' : ''}`}
                        onClick={(e) => moveToCollection(e, collections[i])}>
                        {collections[i]}
                    </button>
                </li>
            );
        }
        array.push(createNewCollectionButton);
        return array;
    }
    return (
        <ul>
            <li><strong>Move to collection</strong></li>
            <Dropdown display={currentNote.collection !== '' ? currentNote.collection : 'Select one...'}>
                {collectionsList(user.collections)}
            </Dropdown>
        </ul>
    );
}

function TagNote(props) {
    const { user, currentNote } = props;
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
        props.refreshData();
    }
    const tagsList = (tags) => {
        const createNewTag = (
            <li key={`minimenu-user.collections-createNewTag`} className="createTag">
                <button className="tag createTag" onClick={props.createTag}>
                    Create new
                </button>
            </li>
        );
        if (!tags) return createNewTag;
        let userTags = [];
        for (let i = 0; i < tags.length; i++) {
            let tagName = tags[i];
            const hasTag = elementIsInArray(tagName, currentNote.tags) ? ' hasTag' : '';
            userTags.push(
                <li key={`minimenu-user.tags-${tagName}`}>
                    <button key={`minimenu-user.tags-${tagName}`} className={`tag${hasTag}`} onClick={(e) => handleTagNote(e, tagName)}>
                        {tagName}
                    </button>
                </li>
            );
        }
        userTags.push(createNewTag);
        return userTags;
    }
    return (
        <ul className="tagsList">
            <li><strong>Tag note</strong></li>
            {tagsList(user.tags)}
        </ul>
    )
}