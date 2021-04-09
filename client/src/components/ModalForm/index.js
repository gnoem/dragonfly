import { modalFormStore } from "./modalFormStore";
import { Form } from "../Form";

export const ModalForm = (props) => {
    const { children } = props;
    return (
        <Form modal={true} {...props}>
            {children}
        </Form>
    );
}

export { modalFormStore }