// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { registerDecorator, ValidationOptions, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

// Custom validator for strong passwords
@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    if (!password) return false;
    
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}

// Custom validator for valid usernames
@ValidatorConstraint({ name: 'isValidUsername', async: false })
export class IsValidUsernameConstraint implements ValidatorConstraintInterface {
  validate(username: string, args: ValidationArguments) {
    if (!username) return false;
    
    // Username must be 3-30 characters, alphanumeric with underscores and hyphens
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return usernameRegex.test(username);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Username must be 3-30 characters long and contain only letters, numbers, underscores, and hyphens';
  }
}

export function IsValidUsername(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidUsernameConstraint,
    });
  };
}

// Custom validator for valid DID format
@ValidatorConstraint({ name: 'isValidDID', async: false })
export class IsValidDIDConstraint implements ValidatorConstraintInterface {
  validate(did: string, args: ValidationArguments) {
    if (!did) return false;
    
    // DID format: did:method:identifier
    const didRegex = /^did:[a-z0-9]+:[a-zA-Z0-9._%-]+$/;
    return didRegex.test(did);
  }

  defaultMessage(args: ValidationArguments) {
    return 'DID must be in the format did:method:identifier';
  }
}

export function IsValidDID(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidDIDConstraint,
    });
  };
}

// Custom validator for valid IPFS CID
@ValidatorConstraint({ name: 'isValidIPFSCID', async: false })
export class IsValidIPFSCIDConstraint implements ValidatorConstraintInterface {
  validate(cid: string, args: ValidationArguments) {
    if (!cid) return false;
    
    // IPFS CID format (basic validation)
    const cidRegex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$|^bafy[a-z2-7]{55}$/;
    return cidRegex.test(cid);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid IPFS CID format';
  }
}

export function IsValidIPFSCID(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidIPFSCIDConstraint,
    });
  };
}

// Custom validator for valid JSON string
@ValidatorConstraint({ name: 'isValidJSON', async: false })
export class IsValidJSONConstraint implements ValidatorConstraintInterface {
  validate(jsonString: string, args: ValidationArguments) {
    if (!jsonString) return false;
    
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid JSON format';
  }
}

export function IsValidJSON(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidJSONConstraint,
    });
  };
}

// Custom validator for array with unique values
@ValidatorConstraint({ name: 'isUniqueArray', async: false })
export class IsUniqueArrayConstraint implements ValidatorConstraintInterface {
  validate(array: any[], args: ValidationArguments) {
    if (!Array.isArray(array)) return false;
    
    const uniqueArray = [...new Set(array)];
    return uniqueArray.length === array.length;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Array must contain unique values';
  }
}

export function IsUniqueArray(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUniqueArrayConstraint,
    });
  };
} 