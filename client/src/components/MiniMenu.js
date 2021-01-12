import { useEffect, useRef } from 'react';
import { elementHasParent } from '../utils';

export default function MiniMenu({ content, exitMenu }) {
    const menuBox = useRef(null);
    useEffect(() => {
        if (!content) return;
        const closeMenu = (e) => {
            if (elementHasParent(e.target, '#demo')) return; // todo dev only
            if (elementHasParent(e.target, '.MiniMenu ul')) return;
            if (elementHasParent(e.target, '.Modal')) return; // specifically so that collections minimenu doesn't disappear when creating new collection
            exitMenu();
        }
        window.addEventListener('click', closeMenu);
        return () => {
            window.removeEventListener('click', closeMenu);
        }
    }, [exitMenu, content]);
    if (!content) return null;
    return (
        <div className="MiniMenu" ref={menuBox}>
            {content}
        </div>
    )
}