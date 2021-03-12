import { useState, useRef } from 'react';
import Tooltip from '../../Tooltip';

export const NoteOperations = (props) => {
    const { currentNote } = props;
    const [collectionsTooltip, setCollectionsTooltip] = useState(false);
    const [tagsTooltip, setTagsTooltip] = useState(false);
    const collectionsRef = useRef(null);
    const tagsRef = useRef(null);
    const starNote = async () => {
        const response = await fetch(`/note/${currentNote._id}/star`, { method: 'PUT' });
        const body = await response.json();
        if (!body.success) return console.log(body.error);
        props.refreshData();
    }
    const confirmMoveToTrash = () => {};
    return (
        <div className="NoteOperations">
            <div className="OptionItem">
                <button className={currentNote.starred ? 'hasStar' : null} onClick={starNote}>
                    <i className="fas fa-star"></i>
                </button>
                <Tooltip open={false} defaultContent={currentNote.starred ? 'Unstar' : 'Add star'} />
                <div className="tooltipArrow"></div>
            </div>
            <div className="OptionItem">
                <button onClick={() => setCollectionsTooltip(true)} ref={collectionsRef}>
                    <i className="fas fa-book"></i>
                </button>
                <Tooltip
                    {...props}
                    open={collectionsTooltip}
                    defaultContent="Move to collection"
                    parent={collectionsRef.current}
                    updateTooltipOpen={setCollectionsTooltip} />
                <div className="tooltipArrow"></div> {/* used to be .tooltip::before but needs to be positioned relative to .optionItem, not .tooltip */}
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
            </div>
        </div>
    );
}