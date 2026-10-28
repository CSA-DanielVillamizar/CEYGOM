// Product reference codes as printed in the data sheets (BP0101, RA1301, AC0801A, TE0901...).
// Shared by the quote contract, the quote list and the catalog search; it must stay free of other imports
// so the small browser scripts can use it.
export const REFERENCE_PATTERN = /^[A-Z]{1,4}\d{3,6}[A-Z]?$/;

export const isReference = (value: string): boolean => REFERENCE_PATTERN.test(value);
