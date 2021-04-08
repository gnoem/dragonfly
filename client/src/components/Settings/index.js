import { Page } from "../Page";

export const Settings = () => {
    return (
        <Page className="Settings">
            <h2>Appearance</h2>
            <ul>
                <li>Theme!!</li>
            </ul>
            <h2>Notes</h2>
            <ul>
                <li>Warn me before moving a note into the Trash</li>
                <li>Automatically delete notes in my Trash (y/n) after ____ days</li>
            </ul>
            <h2>Privacy</h2>
            <ul>
                <li>Keep me logged in on this device (y/n) for ____ </li>
                <li>Log me out everywhere</li>
            </ul>
        </Page>
    );
}