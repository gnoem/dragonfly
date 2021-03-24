import "./SortByTag.css";
import { useContext } from "react";
import { DataContext } from "contexts";
import { Tag, TagList } from "../../Tags";
import { Dropdown } from "../../Dropdown";

export const SortByTag = ({ user, view, updateView, refreshData, createModal }) => {
    const { tags } = useContext(DataContext);
    return (
        <div className="SortByTag">
            {/* <Hint className="qmark">Right-click on a tag for more options.</Hint> */}
            <SortTagTitle {...{ tags }} viewingTags={view.tags.length > 0} />
            <SortTagGrid {...{ user, tags, view, updateView, refreshData, createModal }} />
            <SortTagOptions {...{ tags, updateView }} />
        </div>
    );
}

const SortTagTitle = ({ tags, viewingTags }) => {
    if (!tags.length) return <h2>Create your first tag:</h2>;
    return <h2>{viewingTags ? 'Viewing' : 'View'} notes tagged:</h2>;
}

const SortTagGrid = ({ user, tags, view, updateView, refreshData, createModal }) => {
    const toggleTag = (tag) => {
        const updatedArray = (prevView) => {
            const tagsArray = [...prevView.tags];
            const index = tagsArray.findIndex(tagInList => tagInList._id === tag._id);
            const isInArray = index !== -1;
            if (isInArray) tagsArray.splice(index, 1); else tagsArray.push(tag);
            return tagsArray;
        }
        updateView(prevView => ({
            ...prevView,
            tags: updatedArray(prevView)
        }));
    }
    const tagList = () => {
        const formOptions = {
            _id: user._id,
            onSuccess: () => refreshData()
        }
        const createTag = () => createModal('createTag', 'form', formOptions);
        const addNew = <Tag key="SortByTag-addNew" name="Add new" onClick={createTag} />;
        const list = tags.map(tag => {
            const { _id, name } = tag;
            const selected = (() => {
                const index = view.tags.findIndex(viewingTag => viewingTag._id === _id);
                return index !== -1;
            })();
            const formOptions = { _id, name, onSuccess: () => refreshData() }
            const editTag = () => createModal('editTag', 'form', formOptions);
            const deleteTag = () => createModal('deleteTag', 'form', formOptions);
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

const SortTagOptions = ({ tags, updateView }) => {
    const updateSortMethod = (value) => {
        updateView(prevView => ({
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