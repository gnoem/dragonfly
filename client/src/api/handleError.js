export const handleError = (response) => {
    if (!response.ok) throw `Error ${response.status}: ${response.statusText}`;
    return response;
}