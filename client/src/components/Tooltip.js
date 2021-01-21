import { useState, useEffect, useRef } from 'react';

export default function Tooltip({ content, defaultContent, parent, updateTooltipContent }) {
    const [tooltipContent, setTooltipContent] = useState(content || defaultContent);
    const tooltip = useRef(null);
    useEffect(() => {
        if (!tooltip || !tooltip.current) return;
        if (!content || !parent) return; // button hasn't been clicked
        setTooltipContent(content);
        const closeTooltip = (e) => {
            if (!parent.contains(e.target) && !tooltip.current.contains(e.target)) {
                setTooltipContent(defaultContent);
                updateTooltipContent(false);
            }
        }
        window.addEventListener('click', closeTooltip);
        return () => {console.log('removing event listener'); window.removeEventListener('click', closeTooltip);}
    }, [content]);
    return (
        <div className={`tooltip${content ? ' menu' : ''}`} ref={tooltip}>
            {tooltipContent}
        </div>
    );
}