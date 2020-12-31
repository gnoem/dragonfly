export default function Modal(props) {
    return (
        <div className="Modal">
            <button className="stealth exit"><i class="fas fa-times"></i></button>
            {props.children}
        </div>
    )
}