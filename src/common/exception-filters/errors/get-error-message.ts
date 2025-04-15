export const enum ERROR_MESSAGE_KEYS {
  INVALID_TOKEN = 'INVALID_TOKEN',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_POSITION = 'INVALID_POSITION',
  INVALID_DATA_FORMAT = 'INVALID_DATA_FORMAT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
}

export const getErrorMessage = (
  key: ERROR_MESSAGE_KEYS,
  opts: Record<string, any> = {},
) =>
  ({
    INVALID_TOKEN: () => 'The provided token is invalid or has expired.',
    NOT_FOUND: ({ name, id }) => `The ${name} with ID ${id} was not found.`,
    FORBIDDEN: ({ name, id }) => `The ${name} with ID ${id} is forbidden`,
    INVALID_POSITION: ({ position, length }) =>
      `The provided position (${position}) is invalid. The maximum allowed position is ${length}.`,
    INVALID_DATA_FORMAT: () => `The data format is invalid.`,
    VALIDATION_ERROR: () => `The data is invalid.`,
    ALREADY_EXISTS: ({ name, id }) => `The ${name} with ID ${id} already exists.`,
    // @ts-expect-error - this is a placeholder for future error messages
  })[key](opts);
