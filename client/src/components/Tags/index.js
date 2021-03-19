import { useState } from "react";
import Dropdown from "../Dropdown";
import { MiniMenu } from "../MiniMenu";

export const TagList = ({ children, className }) => {
    return (
        <div className={`TagList ${className ?? ''}`}>
            {children}
        </div>
    );
}

export const Tag = ({ name, selected, onClick, contextMenu }) => {
    const [show, setShow] = useState(false);
    const contextMenuClick = (e) => {
        if (!contextMenu) return;
        e.preventDefault();
        setShow(true);
    }
    return (
        <div className={`Tag ${selected ? 'selected' : ''}`}>
            <button onClick={onClick} onContextMenu={contextMenuClick}>{name}</button>
            {contextMenu && <MiniMenu show={show} updateShow={setShow} menuItems={contextMenu.menuItems} />}
        </div>
    );
}

export const SortByTag = (props) => {
    const { view } = props;
    const { sortMethod } = view;
    return (
        <div className="SortByTag">
            {/* <Hint className="qmark">Right-click on a tag for more options.</Hint> */}
            <SortTagTitle {...props} viewingTags={view.tags.length > 0} />
            <SortTagGrid {...props} sortMethod={sortMethod ?? 'all'} />
            <SortTagOptions {...props} />
        </div>
    );
}

const SortTagTitle = ({ tags, viewingTags }) => {
    if (!tags.length) return <h2>Create your first tag:</h2>;
    return <h2>{viewingTags ? 'Viewing' : 'View'} notes tagged:</h2>;
}

const SortTagGrid = (props) => {
    const { user, view, tags } = props;
    const toggleTag = (tag) => {
        const updatedArray = (prevView) => {
            const tagsArray = [...prevView.tags];
            const index = tagsArray.findIndex(tagInList => tagInList._id === tag._id);
            const isInArray = index !== -1;
            if (isInArray) tagsArray.splice(index, 1); else tagsArray.push(tag);
            return tagsArray;
        }
        props.updateView(prevView => ({
            ...prevView,
            tags: updatedArray(prevView)
        }));
    }
    const tagList = () => {
        const formOptions = {
            _id: user._id,
            onSuccess: props.refreshData
        }
        const createTag = () => props.updateModal('createTag', 'form', formOptions);
        const addNew = <Tag key="SortByTag-addNew" name="Add new" onClick={createTag} />;
        const list = tags.map(tag => {
            const { _id, name } = tag;
            const selected = (() => {
                const index = view.tags.findIndex(viewingTag => viewingTag._id === _id);
                return index !== -1;
            })();
            const formOptions = { _id, name, onSuccess: props.refreshData }
            const editTag = () => props.updateModal('editTag', 'form', formOptions);
            const deleteTag = () => props.updateModal('deleteTag', 'form', formOptions);
            const tagContextMenu = {
                menuItems: [{ label: 'Edit', onClick: editTag }, { label: 'Delete', onClick: deleteTag }]
            }
            return (
                <Tag
                    key={`SortByTag-${_id}`}
                    name={name}
                    selected={selected}
                    onClick={() => toggleTag(tag)}
                    contextMenu={tagContextMenu} />
            ); 
        });
        list.push(addNew);
        return list;
    }
    return (
        <TagList>
            {tagList()}
        </TagList>
    );
}

const SortTagOptions = (props) => {
    const { tags } = props;
    const updateSortMethod = (value) => {
        props.updateView(prevView => ({
            ...prevView,
            sortMethod: value
        }));
    }
    const dropdown = {
        listItems: () => [{ value: 'all', display: 'all' }, { value: 'any', display: 'any' }],
        defaultValue: () => dropdown.listItems()[0]
    }
    if (!tags.length) return null;
    return (
        <div className="SortTagOptions">
            Find notes with
            <Dropdown defaultValue={dropdown.defaultValue()} listItems={dropdown.listItems()} onChange={updateSortMethod} />
            of the selected tags.
        </div>
    );
}