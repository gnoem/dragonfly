import "./NoteOperations.css";
import { useState, useRef } from "react";
import { Note } from "../../../api";
import { handleError } from "../../../services";
import { Tooltip } from "../../Tooltip";

export const NoteOperations = (props) => {
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
            <TrashNote {...props} />
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
    const { currentNote, updateModal } = props;
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
        const onSuccess = () => props.refreshData(null, () => setInstantToggle(false));
        const onError = (err) => {
            setInstantToggle(false);
            handleError(err, { updateModal });
        }
        Note.starNote(currentNote._id)
            .then(onSuccess)
            .catch(onError);
    }
    return (
        <OptionItem {...props}
            name="star"
            className={className}
            onClick={handleClick}
            defaultContent={isStarred ? 'Unstar' : 'Add star'} />
    );
}

const TrashNote = (props) => {
    const { currentNote } = props;
    const handleClick = () => {
        const formOptions = {
            _id: currentNote._id,
            onSuccess: () => {
                props.refreshData();
                props.updateCurrentNote(null);
            }
        }
        props.updateModal('trashNote', 'form', formOptions);
    }
    return (
        <OptionItem {...props}
            name="trash"
            onClick={handleClick}
            defaultContent="Move to Trash" />
    );
}