var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { registerDecorator, ValidatorConstraint } from 'class-validator';
let IsStrongPasswordConstraint = class IsStrongPasswordConstraint {
    validate(password, args) {
        if (!password)
            return false;
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongPasswordRegex.test(password);
    }
    defaultMessage(args) {
        return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
};
IsStrongPasswordConstraint = __decorate([
    ValidatorConstraint({ name: 'isStrongPassword', async: false })
], IsStrongPasswordConstraint);
export { IsStrongPasswordConstraint };
export function IsStrongPassword(validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsStrongPasswordConstraint,
        });
    };
}
let IsValidUsernameConstraint = class IsValidUsernameConstraint {
    validate(username, args) {
        if (!username)
            return false;
        const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
        return usernameRegex.test(username);
    }
    defaultMessage(args) {
        return 'Username must be 3-30 characters long and contain only letters, numbers, underscores, and hyphens';
    }
};
IsValidUsernameConstraint = __decorate([
    ValidatorConstraint({ name: 'isValidUsername', async: false })
], IsValidUsernameConstraint);
export { IsValidUsernameConstraint };
export function IsValidUsername(validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidUsernameConstraint,
        });
    };
}
let IsValidDIDConstraint = class IsValidDIDConstraint {
    validate(did, args) {
        if (!did)
            return false;
        const didRegex = /^did:[a-z0-9]+:[a-zA-Z0-9._%-]+$/;
        return didRegex.test(did);
    }
    defaultMessage(args) {
        return 'DID must be in the format did:method:identifier';
    }
};
IsValidDIDConstraint = __decorate([
    ValidatorConstraint({ name: 'isValidDID', async: false })
], IsValidDIDConstraint);
export { IsValidDIDConstraint };
export function IsValidDID(validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidDIDConstraint,
        });
    };
}
let IsValidIPFSCIDConstraint = class IsValidIPFSCIDConstraint {
    validate(cid, args) {
        if (!cid)
            return false;
        const cidRegex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$|^bafy[a-z2-7]{55}$/;
        return cidRegex.test(cid);
    }
    defaultMessage(args) {
        return 'Invalid IPFS CID format';
    }
};
IsValidIPFSCIDConstraint = __decorate([
    ValidatorConstraint({ name: 'isValidIPFSCID', async: false })
], IsValidIPFSCIDConstraint);
export { IsValidIPFSCIDConstraint };
export function IsValidIPFSCID(validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidIPFSCIDConstraint,
        });
    };
}
let IsValidJSONConstraint = class IsValidJSONConstraint {
    validate(jsonString, args) {
        if (!jsonString)
            return false;
        try {
            JSON.parse(jsonString);
            return true;
        }
        catch {
            return false;
        }
    }
    defaultMessage(args) {
        return 'Invalid JSON format';
    }
};
IsValidJSONConstraint = __decorate([
    ValidatorConstraint({ name: 'isValidJSON', async: false })
], IsValidJSONConstraint);
export { IsValidJSONConstraint };
export function IsValidJSON(validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidJSONConstraint,
        });
    };
}
let IsUniqueArrayConstraint = class IsUniqueArrayConstraint {
    validate(array, args) {
        if (!Array.isArray(array))
            return false;
        const uniqueArray = [...new Set(array)];
        return uniqueArray.length === array.length;
    }
    defaultMessage(args) {
        return 'Array must contain unique values';
    }
};
IsUniqueArrayConstraint = __decorate([
    ValidatorConstraint({ name: 'isUniqueArray', async: false })
], IsUniqueArrayConstraint);
export { IsUniqueArrayConstraint };
export function IsUniqueArray(validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsUniqueArrayConstraint,
        });
    };
}
//# sourceMappingURL=validation.decorators.js.map