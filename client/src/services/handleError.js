export const handleError = (err, handlers = {}) => {
    const { handleFormError, createModal } = handlers;
    if (err.name === 'ValidationError') {
        return handleFormError ? handleFormError(err.error) : createModal(err.message, 'error');
    }
    return createModal('somethingWentWrong', 'customError', err);
}