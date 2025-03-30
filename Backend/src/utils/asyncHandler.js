const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        // Ensure the requestHandler is wrapped in a promise.
        Promise.resolve(requestHandler(req, res, next)).catch(next);
    };
};

export { asyncHandler };
