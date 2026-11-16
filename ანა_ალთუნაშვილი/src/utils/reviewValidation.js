export const reviewValidators = {
    rating: (value) => Number.isInteger(value) && value >= 1 && value <= 5 ? undefined : 'Please select a rating',
    comment: (value) => value.trim().length >= 10 ? undefined : 'Comment must be at least 10 characters',
};
