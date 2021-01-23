import { useState, useEffect, useRef } from 'react';
import Loading from './Loading';
import Dropdown from './Dropdown';
import { elementHasParent } from '../utils';

export default function Tooltip(props) {
    const { open, defaultContent, parent, updateTooltipOpen } = props;
    const [tooltipContent, setTooltipContent] = useState(open || defaultContent);
    const tooltip = useRef(null);
    useEffect(() => {
        if (!tooltip || !tooltip.current) return;
        if (!open || !parent) return; // button hasn't been clicked
        setTooltipContent(() => {
            switch (defaultContent) {
                case 'Move to collection': return <MoveNoteToCollection {...props} />;
                case 'Tag note': return null;
                default: return null;
            }
        });
        const closeTooltip = (e) => {
            if (parent.contains(e.target)) return;
            if (tooltip.current.contains(e.target)) return;
            if (elementHasParent(e.target, '.Modal')) return;
            setTooltipContent(defaultContent);
            updateTooltipOpen(false);
            if (tooltip.current) tooltip.current.style.maxHeight = '2rem';
        }
        window.addEventListener('click', closeTooltip);
        return () => {console.log('removing event listener'); window.removeEventListener('click', closeTooltip);}
    }, [open]);
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

export function MoveNoteToCollection(props) {
    const { user, currentNote, updateModalObject, gracefullyCloseModal, refreshData } = props;
    const modalContent = useRef(null);
    const miniMenuRef = useRef(null);
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
                <button onClick={() => createCollection()} className="notOption">
                    <i className="fas fa-plus-circle" style={{ marginRight: '0.2rem' }}></i> Create new
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
        <ul>
            <li><strong>Move to collection</strong></li>
            {collectionsList(user.collections)}
        </ul>
    )
}