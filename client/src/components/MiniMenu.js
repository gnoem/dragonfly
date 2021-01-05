import { useEffect, useRef } from 'react';
import { elementHasParent } from '../utils';

export default function MiniMenu(props) {
    const menuBox = useRef(null);
    const closeMenu = (e) => {
        if (elementHasParent(e.target, '.MiniMenu ul')) return;
        props.exitMenu();
    }
    useEffect(() => {
        window.addEventListener('click', closeMenu);
        return () => {
            window.removeEventListener('click', closeMenu);
        }
    }, []);
    return (
        <div className="MiniMenu" ref={menuBox}>
            {props.children}
        </div>
    )
}