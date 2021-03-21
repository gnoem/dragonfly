import "./Dropdown.css";
import { useEffect, useRef, useState } from "react";
import { elementHasParent } from "../../utils";

export const Dropdown = (props) => {
    const { defaultValue, listItems, restoreDefault } = props;
    const [display, setDisplay] = useState(() => {
        if (!listItems || !listItems.length) return 'Add new...';
        if (!defaultValue) return 'Select one';
        return defaultValue.display;
    });
    const [isOpen, setIsOpen] = useState(false);
    const [addingNew, setAddingNew] = useState(false);
    const dropdownList = useRef(null);
    useEffect(() => {
        const closeDropdown = (e) => {
            if (elementHasParent(e.target, '.dropdownDisplay')) return;
            if (elementHasParent(e.target, '.addNew')) return;
            setIsOpen(false);
        }
        window.addEventListener('click', closeDropdown);
        return () => window.removeEventListener('click', closeDropdown);
    }, []);
    useEffect(() => {
        if (!dropdownList || !dropdownList.current) return;
        if (isOpen) dropdownList.current.style.maxHeight = dropdownList.current.scrollHeight + 1 + 'px'; // plus 1px to account for 1px bottom border
        else {
            dropdownList.current.style.maxHeight = '0px';
            setAddingNew(false); // unrelated to maxHeight adjustment thing
        }
    }, [isOpen]);
    useEffect(() => {
        if (addingNew) dropdownList.current.style.maxHeight = dropdownList.current.scrollHeight + 1 + 'px';
    }, [addingNew]);
    useEffect(() => {
        if (restoreDefault) setDisplay(defaultValue.display);
    // defaultValue is guaranteed to stay the same during the lifetime of this component so I think it's safe to include here?
    // but maybe read up on if it's better to eslint-disable-next-line instead
    }, [restoreDefault, defaultValue?.display]);
    const toggleIsOpen = () => setIsOpen(prevState => !prevState);
    const handleClick = (e) => {
        setDisplay(e.target.innerHTML);
        props.onChange(e.target.getAttribute('data-value'));
    }
    const generateList = () => {
        const buttonForAddNew =
            <AddNew {...props}
                key="dropdownItem-addNew"
                addingNew={addingNew}
                updateAddingNew={setAddingNew}
                updateIsOpen={setIsOpen}
                updateDisplay={setDisplay}
            />;
        if ((!listItems || !listItems.length) && props.addNew) return buttonForAddNew;
        const array = [];
        for (let item of listItems) {
            array.push(
                <li className="dropdownItem" key={`dropdownItem-${item.value}`}>
                    <button type="button" data-value={item.value} onClick={handleClick}>{item.display}</button>
                </li>
            );
        }
        if (props.addNew) array.push(buttonForAddNew);
        return array;
    }
    return (
        <div className={`Dropdown${isOpen ? ' expanded' : ''}`} style={props.style}>
            <div className="dropdownDisplay" onClick={toggleIsOpen}>{display}</div>
            <ul className="dropdownList" ref={dropdownList}>{generateList()}</ul>
        </div>
    );
}

function AddNew(props) {
    const { addingNew } = props;
    const [inputValue, setInputValue] = useState(null);
    const inputRef = useRef(null);
    useEffect(() => {
        if (!addingNew) return setInputValue(null);
        inputRef.current.focus();
        const handleKeydown = (e) => {
            if (e.key === 'Escape') return props.updateAddingNew(false);
            if (e.key === 'Enter') {
                e.preventDefault();
                props.addNew(inputRef.current.value);
                props.updateDisplay(inputRef.current.value);
                props.updateIsOpen(false);
                return;
            }
        }
        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    }, [addingNew]);
    return (
        <li className="dropdownItem">
            {addingNew
                ?   <button type="button" className="addNew active">
                        <input
                            ref={inputRef}
                            type="text"
                            defaultValue={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <span className="inputHint">Press Enter to submit, Esc to cancel.</span>
                    </button>
                :   <button type="button" className="addNew" onClick={() => props.updateAddingNew(true)}>
                        {props.buttonContent || 'Add new...'}
                    </button>
                }
        </li>
    );
}