import "./NoteOperations.css";
import { useState, useContext, useRef } from "react";
import { Note } from "../../../api";
import { ViewContext, MobileContext } from "../../../contexts";
import { handleError } from "../../../services";
import { Tooltip } from "../../Tooltip";

export const NoteOperations = ({ currentNote, editorState, updateEditorState, refreshData, createModal }) => {
    const { mobileLayout } = useContext(MobileContext);
    const { updateCurrentNote } = useContext(ViewContext);
    const [collectionsTooltip, setCollectionsTooltip] = useState(false);
    const [tagsTooltip, setTagsTooltip] = useState(false);
    const [formatTooltip, setFormatTooltip] = useState(false);
    return (
        <div className="NoteOperations">
            {mobileLayout && (
                <OpenFormattingOptions {...{
                    formatTooltip,
                    updateFormatTooltip: setFormatTooltip,
                    editorState,
                    updateEditorState
                }} />
            )}
            <StarNote {...{ currentNote, refreshData, createModal }} />
            <OptionItem
                name="collection"
                onClick={() => setCollectionsTooltip(true)}
                tooltipWillOpen={{ tooltipOpen: collectionsTooltip, updateTooltipOpen: setCollectionsTooltip }}
                overflow={true}
                defaultContent="Move to collection" />
            <OptionItem
                name="tags"
                onClick={() => setTagsTooltip(true)}
                ignoreClick={['.Modal']}
                tooltipWillOpen={{ tooltipOpen: tagsTooltip, updateTooltipOpen: setTagsTooltip }}
                defaultContent="Tag this note" />
            <TrashNote {...{ currentNote, updateCurrentNote, refreshData, createModal }} />
        </div>
    );
}

const OptionItem = ({ name, className, onClick, onMouseDown, tooltipWillOpen, overflow, editorState, updateEditorState, ignoreClick, defaultContent }) => {
    const tooltipParent = useRef(null);
    return (
        <div className={`OptionItem ${className ?? ''}`}>
            <button className={name} onMouseDown={onMouseDown} onClick={onMouseDown ? null : onClick} ref={tooltipParent}></button>
            <Tooltip {...{
                name,
                tooltipWillOpen,
                overflow,
                editorState,
                updateEditorState,
                ignoreClick,
                defaultContent
            }} parent={tooltipParent} />
            <div className="tooltipArrow"></div>
        </div>
    );
}

const OpenFormattingOptions = ({ formatTooltip, updateFormatTooltip, editorState, updateEditorState }) => {
    const handleMouseDown = (e) => {
        e.preventDefault();
        updateFormatTooltip(true);
    }
    return (
        <OptionItem
            name="format"
            onMouseDown={handleMouseDown}
            tooltipWillOpen={{ tooltipOpen: formatTooltip, updateTooltipOpen: updateFormatTooltip }}
            defaultContent="Formatting options"
            {...{ editorState, updateEditorState }} />
    )
}

const StarNote = ({ currentNote, refreshData, createModal }) => {
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
        const onSuccess = () => refreshData(() => setInstantToggle(false));
        const onError = (err) => {
            setInstantToggle(false);
            handleError(err, { createModal });
        }
        Note.starNote(currentNote._id)
            .then(onSuccess)
            .catch(onError);
    }
    return (
        <OptionItem
            name="star"
            className={className}
            onClick={handleClick}
            defaultContent={isStarred ? 'Unstar' : 'Add star'} />
    );
}

const TrashNote = ({ currentNote, updateCurrentNote, refreshData, createModal }) => {
    const handleClick = () => {
        const formOptions = {
            _id: currentNote._id,
            onSuccess: () => {
                refreshData();
                updateCurrentNote(null);
            }
        }
        createModal('trashNote', 'form', formOptions);
    }
    return (
        <OptionItem
            name="trash"
            onClick={handleClick}
            defaultContent="Move to Trash" />
    );
}