import { useState, useRef } from 'react';
import { Tooltip } from '../../Tooltip';
import { Note } from '../../../helpers';

export const NoteOperations = (props) => {
    const { currentNote } = props;
    const [collectionsTooltip, setCollectionsTooltip] = useState(false);
    const [tagsTooltip, setTagsTooltip] = useState(false);
    return (
        <div className="NoteOperations">
            <OptionItem {...props}
                name="star"
                className={currentNote.starred ? 'hasStar' : null}
                onClick={() => Note.starNote(props, currentNote)}
                defaultContent={currentNote.starred ? 'Unstar' : 'Add star'} />
            <OptionItem {...props}
                name="collection"
                onClick={() => setCollectionsTooltip(true)}
                tooltipWillOpen={{ tooltipOpen: collectionsTooltip, updateTooltipOpen: setCollectionsTooltip }}
                overflow={true}
                defaultContent="Move to collection" />
            <OptionItem {...props}
                name="tags"
                onClick={() => setTagsTooltip(true)}
                ignoreClick={['.Modal']}
                tooltipWillOpen={{ tooltipOpen: tagsTooltip, updateTooltipOpen: setTagsTooltip }}
                defaultContent="Tag this note" />
            <OptionItem {...props}
                name="trash"
                onClick={() => props.updateModal('trashNote', 'form', { _id: currentNote._id, callback: () => props.updateCurrentNote(null) })}
                // todo test callback
                defaultContent="Move to Trash" />
        </div>
    );
}

const OptionItem = (props) => {
    const { name, className, onClick } = props;
    const tooltipParent = useRef(null);
    return (
        <div className={`OptionItem ${className ?? ''}`}>
            <button className={name} onClick={onClick} ref={tooltipParent}></button>
            <Tooltip {...props} parent={tooltipParent} />
            <div className="tooltipArrow"></div>
        </div>
    );
}