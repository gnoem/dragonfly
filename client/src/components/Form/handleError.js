export const handleError = (err, handlers = {}) => {
    const { handleFormError, updateModal } = handlers;
    if (err.name === 'ValidationError') return handleFormError ? handleFormError(err.error) : updateModal(err.message, 'error');
    return updateModal(err.message, 'error');
}