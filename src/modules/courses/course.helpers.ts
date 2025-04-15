import { ValidationError } from 'class-validator';

type TFormattedValidationError = {
    field: string;
    errors: string[] | { index: string; errors: ValidationError[] }[];
  }

export const formatValidationErrors = (errors: ValidationError[]): TFormattedValidationError[] | undefined => {
    return errors.map(error => ({
      field: error.property,
      errors: error.constraints 
        ? Object.values(error.constraints || [])
        : error.children?.map(child => ({
            index: child.property,
            errors: child.children || []
          })) || []
    }));
  }