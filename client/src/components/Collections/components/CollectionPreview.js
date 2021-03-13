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
    const howMany = (() => {
        const notesInCollection = allNotes.filter(note => note.collectionId === _id);
        return notesInCollection.length;
    })();
    return (
        <ListItemContent>
            {howMany} notes
        </ListItemContent>
    );
}

const CollectionPreviewButton = (props) => {
    const { _id, name } = props;
    const [showMiniMenu, setShowMiniMenu] = useState(false);
    const editCollection = () => {
        props.updateModal('editCollection', 'form', { _id, name });
    };
    const deleteCollection = () => {
        props.updateModal('deleteCollection', 'form', { _id, name });
    };
    const menuItems = [{ label: 'Edit', onClick: () => editCollection() }, { label: 'Delete', onClick: () => deleteCollection() }]
    return (
        <div className="previewButton">
            <button onClick={() => setShowMiniMenu(true)} className="icon ellipsis round-basic"></button>
            <MiniMenu show={showMiniMenu} updateShow={setShowMiniMenu} menuItems={menuItems} />
        </div>
    );
}