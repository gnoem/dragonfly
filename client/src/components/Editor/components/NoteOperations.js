import { useState, useRef } from 'react';
import { Tooltip } from '../../Tooltip';
import { Note } from '../../../api';

export const NoteOperations = (props) => {
    const { currentNote } = props;
    const [collectionsTooltip, setCollectionsTooltip] = useState(false);
    const [tagsTooltip, setTagsTooltip] = useState(false);
    return (
        <div className="NoteOperations">
            <StarNote {...props} />
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

const StarNote = (props) => {
    const { currentNote } = props;
    const [pulse, setPulse] = useState(false);
    const [instantToggle, setInstantToggle] = useState(null);
    const isStarred = (() => {
        let value = currentNote.starred;
        if (instantToggle) value = !value;
        return value;
    })();
    const className = (() => {
        const hasStar = `${isStarred ? 'hasStar': null}`;
        const wasClicked = `${pulse ? 'pulse' : null}`;
        return `${hasStar} ${wasClicked}`;
    })();
    const handleClick = () => {
        setPulse(true);
        setTimeout(() => setPulse(false), 500);
        setInstantToggle(true);
        Note.starNote(props, currentNote, () => setInstantToggle(false));
    }
    return (
        <OptionItem {...props}
            name="star"
            className={className}
            onClick={handleClick}
            defaultContent={isStarred ? 'Unstar' : 'Add star'} />
    );
}