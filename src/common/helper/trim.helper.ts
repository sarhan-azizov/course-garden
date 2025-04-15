export const trim = (value: string | undefined): string | undefined =>
  typeof value === 'string' ? value.trim() : value;

export const trimEach = (values: string[] | undefined) =>
  Array.isArray(values) ? values.map((value) => trim(value)) : values;
