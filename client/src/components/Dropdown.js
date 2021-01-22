import { useState, useEffect, useRef } from 'react';
import { elementHasParent } from '../utils';

export default function Dropdown({ addClass, display, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [displayedOption, setDisplayedOption] = useState(display ?? 'Select one...');
    const dropdownList = useRef(null);
    const wholeDropdown = useRef(null);
    useEffect(() => {
        if (!dropdownList.current) return;
        if (isOpen) dropdownList.current.style.maxHeight = (dropdownList.current.scrollHeight < 150) // todo better
            ? dropdownList.current.scrollHeight+1+'px' // to offset 1px border on element
            : '150px';
        else dropdownList.current.style.maxHeight = '0px';
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
        <div className={`Dropdown${isOpen ? ' expanded' : ''}${addClass ? ' '+addClass : ''}`} ref={wholeDropdown}>
            <div className="dropdownDisplay" onClick={() => setIsOpen(open => !open)}>{displayedOption}</div>
            <div className="dropdownList" ref={dropdownList} onClick={closeDropdown}>
                {children}
            </div>
        </div>
    );
}