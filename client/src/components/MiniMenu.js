import { useEffect, useRef } from 'react';
import { elementHasParent } from '../utils';

export default function MiniMenu(props) {
    const menuBox = useRef(null);
    useEffect(() => {
        if (!props.content) return;
        const closeMenu = (e) => {
            if (elementHasParent(e.target, '#demo')) return; // todo dev only
            if (elementHasParent(e.target, '.MiniMenu ul')) return;
            if (elementHasParent(e.target, '.Modal')) return; // specifically so that collections minimenu doesn't disappear when creating new collection
            props.exitMenu();
        }
        window.addEventListener('click', closeMenu);
        return () => {
            window.removeEventListener('click', closeMenu);
        }
    }, [props.content]);
    if (!props.content) return null;
    return (
        <div className="MiniMenu" ref={menuBox}>
            {props.content}
        </div>
    )
}