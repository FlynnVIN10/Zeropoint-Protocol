import { ValidationOptions, ValidationArguments, ValidatorConstraintInterface } from 'class-validator';
export declare class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
    validate(password: string, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare function IsStrongPassword(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
export declare class IsValidUsernameConstraint implements ValidatorConstraintInterface {
    validate(username: string, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare function IsValidUsername(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
export declare class IsValidDIDConstraint implements ValidatorConstraintInterface {
    validate(did: string, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare function IsValidDID(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
export declare class IsValidIPFSCIDConstraint implements ValidatorConstraintInterface {
    validate(cid: string, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare function IsValidIPFSCID(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
export declare class IsValidJSONConstraint implements ValidatorConstraintInterface {
    validate(jsonString: string, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare function IsValidJSON(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
export declare class IsUniqueArrayConstraint implements ValidatorConstraintInterface {
    validate(array: any[], args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare function IsUniqueArray(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
