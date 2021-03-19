import { useState } from 'react';
import { ListItem, ListItemContent } from "../../List/components/ListItem";
import { MiniMenu } from '../../MiniMenu';

export const CollectionPreview = (props) => {
    const { onClick } = props;
    return (
        <ListItem className="collectionPreview"
                  title={<CollectionPreviewTitle {...props} />}
                  onClick={onClick}
                  button={<CollectionPreviewButton {...props} />}>
            <CollectionPreviewContent {...props} />
        </ListItem>
    );
}

const CollectionPreviewTitle = ({ name }) => <h2>{name}</h2>;

const CollectionPreviewContent = (props) => {
    const { allNotes, _id } = props;
    const howManyNotes = (() => {
        const notesInCollection = allNotes.filter(note => note.collectionId === _id);
        if (notesInCollection.length === 1) return '1 note';
        return `${notesInCollection.length} notes`;
    })();
    return (
        <ListItemContent>
            {howManyNotes}
        </ListItemContent>
    );
}

const CollectionPreviewButton = (props) => {
    const { _id, name } = props;
    const [showMiniMenu, setShowMiniMenu] = useState(false);
    const formData = { _id, name, onSuccess: props.refreshData };
    const editCollection = () => props.updateModal('editCollection', 'form', formData);
    const deleteCollection = () => props.updateModal('deleteCollection', 'form', formData);
    const menuItems = [{ label: 'Edit', onClick: editCollection }, { label: 'Delete', onClick: deleteCollection }];
    return (
        <div className="previewButton">
            <button onClick={() => setShowMiniMenu(true)} className="icon ellipsis round-basic"></button>
            <MiniMenu show={showMiniMenu} updateShow={setShowMiniMenu} menuItems={menuItems} />
        </div>
    );
}