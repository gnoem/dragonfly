import { useState, useEffect, useRef } from 'react';

export default function Dropdown({ display, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [displayedOption, setDisplayedOption] = useState(display ?? 'Select one...');
    const dropdownList = useRef(null);
    useEffect(() => {
        if (!dropdownList.current) return;
        if (isOpen) dropdownList.current.style.maxHeight = (dropdownList.current.scrollHeight < 300) // todo better
            ? dropdownList.current.scrollHeight+1+'px' // to offset 1px border on element
            : '300px';
        else dropdownList.current.style.maxHeight = '0px';
    }, [isOpen, children]);
    const closeDropdown = (e) => {
        const selectedOption = e.target.closest('button:not(.notOption)')?.innerHTML;
        if (!selectedOption) return;
        setDisplayedOption(selectedOption);
        setIsOpen(false);
    }
    return (
        <div className={`Dropdown${isOpen ? ' expanded' : ''}`}>
            <div className="dropdownDisplay" onClick={() => setIsOpen(open => !open)}>{displayedOption}</div>
            <div className="dropdownList" ref={dropdownList} onClick={closeDropdown}>{children}</div>
        </div>
    )
}