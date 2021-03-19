import { useState, useEffect, useRef } from 'react';
import Dropdown from '../Dropdown';
import { elementHasParent } from '../../utils';
import { Collection, Note } from '../../api';
import { TagList, Tag } from '../Tags';
import { handleError } from '../Form/handleError';

export const Tooltip = (props) => {
    const { name, parent, tooltipWillOpen, defaultContent, overflow } = props;
    const [adjustHeight, setAdjustHeight] = useState(false);
    const tooltipRef = useRef(null);
    useEffect(() => {
        if (!tooltipWillOpen) return;
        if (!tooltipRef.current) return;
        const { tooltipOpen, updateTooltipOpen } = tooltipWillOpen;
        if (tooltipOpen) {
            tooltipRef.current.style.maxHeight = tooltipRef.current.scrollHeight + 'px';
        }
        const closeTooltip = (e) => {
            if (props.ignoreClick) { // will be an array like ['.Modal', '#menu li']
                for (let selector of props.ignoreClick) {
                    if (elementHasParent(e.target, selector)) return;
                }
            }
            if (!tooltipRef.current || !parent.current) return () => window.removeEventListener('click', closeTooltip);
            if (tooltipRef.current.contains(e.target)) return;
            if (parent.current.contains(e.target)) return;
            tooltipRef.current.classList.add('closing');
            tooltipRef.current.style.maxHeight = '0';
            setTimeout(() => {
                updateTooltipOpen(false);
                tooltipRef.current.classList.remove('closing');
                tooltipRef.current.style = '';
            }, 200);
        }
        window.addEventListener('click', closeTooltip);
        return () => window.removeEventListener('click', closeTooltip);
    }, [tooltipWillOpen?.tooltipOpen, tooltipRef, adjustHeight]);
    const tooltipContent = () => {
        const inherit = { ...props, updateAdjustHeight: setAdjustHeight }
        if (!tooltipWillOpen) return defaultContent;
        const { tooltipOpen } = tooltipWillOpen;
        if (tooltipOpen) return tooltipStore[name](inherit);
        else return defaultContent;
    }
    return (
        <div className={`Tooltip${tooltipWillOpen?.tooltipOpen ? ' open' : ''}${overflow ? ' hasDropdown' : ''}`} ref={tooltipRef}>
            {tooltipContent()}
        </div>
    );
}

const tooltipStore = {
    collection: (props) => <MoveNoteToCollection {...props} />,
    tags: (props) => <TagNote {...props} />
}

const MoveNoteToCollection = (props) => {
    const { user, currentNote, collections, updateModal } = props;
    const handleChange = (collectionId) => {
        Note.moveNoteToCollection(currentNote._id, collectionId)
            .then(props.refreshData)
            .catch(err => handleError(err, { updateModal }));
    }
    const onSuccess = ({ collection }) => {
        props.refreshData();
        handleChange(collection._id);
    }
    const handleAddNew = (name) => {
        Collection.createCollection({ userId: user._id, name })
            .then(onSuccess)
            .catch(err => handleError(err, { updateModal }));
    };
    const dropdown = {
        style: { minWidth: '9rem' },
        listItems: () => {
            return collections.map(collection => ({
                value: collection._id,
                display: collection.name
            }));
        },
        defaultValue: () => {
            return dropdown.listItems().find(item => item.value === currentNote.collectionId);
            // if it's undefined then Dropdown component will just set it to 'Select one'
        }
    }
    return (
        <div>
            <strong>Move to collection</strong>
            <Dropdown
                style={dropdown.style}
                defaultValue={dropdown.defaultValue()}
                listItems={dropdown.listItems()}
                onChange={handleChange}
                addNew={handleAddNew} />
        </div>
    );
}

const TagNote = (props) => {
    const { user, currentNote, tags } = props;
    const [instantToggle, setInstantToggle] = useState([]);
    const addToInstantToggle = (tagId) => {
        const index = instantToggle.indexOf(tagId);
        if (index === -1) setInstantToggle(prevState => {
            const array = [...prevState];
            array.push(tagId);
            return array;
        });
        return index;
    }
    const removeFromInstantToggle = (index) => {
        setInstantToggle(prevState => {
            const array = [...prevState];
            array.splice(index, 1);
            return array;
        });
    }
    const tagNote = (tagId) => {
        const index = addToInstantToggle(tagId);
        const onSuccess = () => props.refreshData().then(() => removeFromInstantToggle(index));
        Note.tagNote(currentNote._id, tagId).then(onSuccess);
    }
    const tagList = () => {
        const createTag = () => {
            const onSuccess = () => props.refreshData().then(() => props.updateAdjustHeight(true));
            props.updateModal('createTag', 'form', { _id: user._id, onSuccess });
        }
        const addNew = <Tag key="Tooltip-addNewTag" name="Add new" onClick={createTag} />;
        const list = tags.map(tag => {
            let hasTag = currentNote.tags.includes(tag._id);
            if (instantToggle.includes(tag._id)) hasTag = !hasTag;
            return <Tag key={`SortByTag-${tag._id}`} name={tag.name} selected={hasTag} onClick={() => tagNote(tag._id)} />; 
        });
        list.push(addNew);
        return list;
    }
    return (
        <div>
            <strong>Tag this note</strong>
            <TagList>
                {tagList()}
            </TagList>
        </div>
    );
}