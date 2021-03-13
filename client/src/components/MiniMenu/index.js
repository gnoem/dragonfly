import { useState, useEffect, useRef } from 'react';

export const MiniMenu = ({ show, updateShow, menuItems, className }) => {
    const [closing, setClosing] = useState(false);
    const miniMenuRef = useRef(null);
    useEffect(() => {
        if (!show) return setClosing(false);
        const closeMiniMenu = (e) => {
            if (miniMenuRef?.current?.contains(e.target)) return;
            setClosing(true);
            setTimeout(() => updateShow(false), 200);
        }
        window.addEventListener('click', closeMiniMenu);
        window.addEventListener('contextmenu', closeMiniMenu);
        return () => {
            window.removeEventListener('click', closeMiniMenu);
            window.removeEventListener('contextmenu', closeMiniMenu);
        }
    }, [show, miniMenuRef]);
    const content = () => {
        return menuItems.map((menuItem) => {
            const { label, onClick } = menuItem;
            const handleClick = () => {
                onClick();
                setClosing(true);
                setTimeout(() => updateShow(false), 200);
            }
            return <button key={`miniMenu-${menuItem.label}`} onClick={handleClick}>{label}</button>;
        });
    }
    if (!show) return null;
    return (
        <div className={`MiniMenu ${className ?? ''} ${closing ? 'goodbye' : ''}`} ref={miniMenuRef}>
            {content()}
        </div>
    );
}