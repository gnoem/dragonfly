import { useState, useEffect, useRef } from 'react';

export default function Dropdown({ display, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [displayedOption, setDisplayedOption] = useState(display ?? 'Select one...');
    const dropdownList = useRef(null);
    useEffect(() => {
        if (!dropdownList.current) return;
        if (isOpen) dropdownList.current.style.maxHeight = dropdownList.current.scrollHeight+'px';
        else dropdownList.current.style.maxHeight = '0px';
    }, [isOpen])
    const closeDropdown = (e) => {
        const selectedCollection = e.target.closest('button').innerHTML;
        if (!selectedCollection) return;
        setDisplayedOption(selectedCollection);
        setIsOpen(false);
    }
    return (
        <div className={`Dropdown${isOpen ? ' expanded' : ''}`}>
            <div className="dropdownDisplay" onClick={() => setIsOpen(open => !open)}>{displayedOption}</div>
            <div className="dropdownList" ref={dropdownList} onClick={closeDropdown}>{children}</div>
        </div>
    )
}