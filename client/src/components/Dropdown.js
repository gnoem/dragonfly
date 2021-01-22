import { useState, useEffect, useRef } from 'react';

export default function Dropdown({ display, children }) {
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
        const selectedOption = e.target.closest('button:not(.notOption)')?.innerHTML;
        if (!selectedOption) return;
        setDisplayedOption(selectedOption);
        setIsOpen(false);
    }
    return (
        <div className={`Dropdown${isOpen ? ' expanded' : ''}`} ref={wholeDropdown}>
            <div className="dropdownDisplay" onClick={() => setIsOpen(open => !open)}>{displayedOption}</div>
            <div className="dropdownList" ref={dropdownList} onClick={closeDropdown}>
                {children}
            </div>
        </div>
    );
}