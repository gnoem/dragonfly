import { useState, useEffect, useRef } from 'react';
import { elementHasParent } from '../utils';

export default function Dropdown({ addClass, display, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [hasScrollbar, setHasScrollbar] = useState(false);
    const [displayedOption, setDisplayedOption] = useState(display ?? 'Select one...');
    const dropdownList = useRef(null);
    const wholeDropdown = useRef(null);
    useEffect(() => {
        if (!dropdownList.current) return;
        const dropdownMaxHeight = (dropdown) => {
            const distanceFromTop = dropdown.getBoundingClientRect().top;
            const elementHeight = dropdown.scrollHeight;
            if (distanceFromTop + elementHeight < window.innerHeight) return elementHeight + 1; // to offset 1px bottom border on dropdown element
            setHasScrollbar(true);
            return (window.innerHeight - distanceFromTop) - 24; // add a bit of padding
        }
        dropdownList.current.style.maxHeight = isOpen ? dropdownMaxHeight(dropdownList.current) + 'px' : '0px';
    }, [isOpen, children]);
    const closeDropdown = (e) => {
        if (elementHasParent(e.target, '.Modal')) return;
        if (!elementHasParent(e.target, '.Dropdown')) return setIsOpen(false);
        const selectedOption = e.target.closest('.dropdownList button:not(.notOption)')?.innerHTML;
        if (!selectedOption) return;
        setDisplayedOption(selectedOption);
        setIsOpen(false);
    }
    useEffect(() => {
        window.addEventListener('click', closeDropdown);
        return () => window.removeEventListener('click', closeDropdown);
    }, []);
    return (
        <div className={`Dropdown${isOpen ? ' expanded' : ''}${addClass ? ' '+addClass : ''}${hasScrollbar ? '' : ' noscroll'}`} ref={wholeDropdown}>
            <div className="dropdownDisplay" onClick={() => setIsOpen(open => !open)}>{displayedOption}</div>
            <div className="dropdownList" ref={dropdownList} onClick={closeDropdown}>
                {children}
            </div>
        </div>
    );
}