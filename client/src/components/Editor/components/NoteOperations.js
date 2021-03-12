import { useState, useRef } from 'react';
import { Tooltip } from '../../Tooltip';
import { starNote } from '../../../helpers';

export const NoteOperations = (props) => {
    const { currentNote } = props;
    const [collectionsTooltip, setCollectionsTooltip] = useState(false);
    const [tagsTooltip, setTagsTooltip] = useState(false);
    const collectionsRef = useRef(null);
    const tagsRef = useRef(null);
    const confirmMoveToTrash = () => {};
    return (
        <div className="NoteOperations">
            <OptionItem {...props}
                name="star"
                className={currentNote.starred ? 'hasStar' : null}
                onClick={() => starNote(props, currentNote)}
                tooltipWillOpen={false}
                defaultContent={currentNote.starred ? 'Unstar' : 'Add star'} />
            <OptionItem {...props}
                name="collection"
                onClick={() => setCollectionsTooltip(true)}
                tooltipWillOpen={{ tooltipOpen: collectionsTooltip, updateTooltipOpen: setCollectionsTooltip }}
                overflow={true}
                defaultContent="Move to collection" />
            {/* <div className="OptionItem">
                <button onClick={() => setCollectionsTooltip(true)} ref={collectionsRef}>
                    <i className="fas fa-book"></i>
                </button>
                <Tooltip
                    {...props}
                    open={collectionsTooltip}
                    defaultContent="Move to collection"
                    parent={collectionsRef.current}
                    updateTooltipOpen={setCollectionsTooltip} />
                <div className="tooltipArrow"></div> {/* used to be .tooltip::before but needs to be positioned relative to .optionItem, not .tooltip
            </div>
            <div className="OptionItem">
                <button onClick={() => setTagsTooltip(true)} ref={tagsRef}>
                    <i className="fas fa-tags"></i>
                </button>
                <Tooltip
                    {...props}
                    open={tagsTooltip}
                    defaultContent="Add tags"
                    parent={tagsRef.current}
                    updateTooltipOpen={setTagsTooltip} />
                <div className="tooltipArrow"></div>
            </div>
            <div className="OptionItem">
                <button onClick={() => confirmMoveToTrash(currentNote._id)}>
                    <i className="fas fa-trash"></i>
                </button>
                <Tooltip open={false} defaultContent="Move to Trash" />
                <div className="tooltipArrow"></div>
            </div> */}
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