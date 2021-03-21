import "./EditorToolbar.css";
import { RichUtils } from "draft-js";

export const EditorToolbar = (props) => {
    const { editorState } = props;
    // todo if focus is on title input, do nothing
    const controlStyle = (e, type, value) => {
        e.preventDefault(); // onMouseDown + e.preventDefault rather than onClick preserves focus state in text editor
        const newState = (type === 'inline')
            ?   RichUtils.toggleInlineStyle(editorState, value)
            :   RichUtils.toggleBlockType(editorState, value);
        props.updateEditorState(newState);
    }
    const isInlineStyleActive = (style) => {
        const inlineStyle = editorState.getCurrentInlineStyle();
        return inlineStyle.has(style) ? 'active' : '';
    }
    const getBlockType = () => {
        const startKey = editorState.getSelection().getStartKey();
        const selectedBlockType = editorState
            .getCurrentContent()
            .getBlockForKey(startKey)
            .getType();
        return selectedBlockType;
    }
    const isBlockTypeActive = (type) => {
        return (type === getBlockType())
            ? 'active'
            : '';
    }
    return (
        <div className="EditorToolbar">
            <div className="group">
                <button className={isInlineStyleActive('BOLD')} onMouseDown={(e) => controlStyle(e, 'inline', 'BOLD')}><i className="fas fa-bold"></i></button>
                <button className={isInlineStyleActive('ITALIC')} onMouseDown={(e) => controlStyle(e, 'inline', 'ITALIC')}><i className="fas fa-italic"></i></button>
                <button className={isInlineStyleActive('UNDERLINE')} onMouseDown={(e) => controlStyle(e, 'inline', 'UNDERLINE')}><i className="fas fa-underline"></i></button>
                <button className={isInlineStyleActive('STRIKETHROUGH')} onMouseDown={(e) => controlStyle(e, 'inline', 'STRIKETHROUGH')}><i className="fas fa-strikethrough"></i></button>
            </div>
            <hr />
            <div className="group">
                <button className={isBlockTypeActive('ALIGN-LEFT')} onMouseDown={(e) => controlStyle(e, 'block', 'ALIGN-LEFT')}><i className="fas fa-align-left"></i></button>
                <button className={isBlockTypeActive('ALIGN-CENTER')} onMouseDown={(e) => controlStyle(e, 'block', 'ALIGN-CENTER')}><i className="fas fa-align-center"></i></button>
                <button className={isBlockTypeActive('ALIGN-RIGHT')} onMouseDown={(e) => controlStyle(e, 'block', 'ALIGN-RIGHT')}><i className="fas fa-align-right"></i></button>
                <button className={isBlockTypeActive('ALIGN-JUSTIFY')} onMouseDown={(e) => controlStyle(e, 'block', 'ALIGN-JUSTIFY')}><i className="fas fa-align-justify"></i></button>
            </div>
            <hr />
            <div className="group">
                <button className={isBlockTypeActive('blockquote')} onMouseDown={(e) => controlStyle(e, 'block', 'blockquote')}><i className="fas fa-quote-left"></i></button>
                <button className={isBlockTypeActive('unordered-list-item')} onMouseDown={(e) => controlStyle(e, 'block', 'unordered-list-item')}><i className="fas fa-list-ul"></i></button>
                <button className={isBlockTypeActive('ordered-list-item')} onMouseDown={(e) => controlStyle(e, 'block', 'ordered-list-item')}><i className="fas fa-list-ol"></i></button>
            </div>
        </div>
    );
}