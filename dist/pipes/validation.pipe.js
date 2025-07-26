var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ValidationPipe_1;
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Counter } from 'prom-client';
const validationErrorCounter = new Counter({
    name: 'validation_errors_total',
    help: 'Total validation errors by field and type',
    labelNames: ['field', 'error_type', 'endpoint']
});
let ValidationPipe = ValidationPipe_1 = class ValidationPipe {
    constructor() {
        this.logger = new Logger(ValidationPipe_1.name);
    }
    async transform(value, { metatype }) {
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }
        const object = plainToClass(metatype, value);
        const errors = await validate(object, {
            whitelist: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
            skipMissingProperties: false,
            skipNullProperties: false,
            skipUndefinedProperties: false,
            validationError: {
                target: false,
                value: false
            }
        });
        if (errors.length > 0) {
            errors.forEach(error => {
                Object.keys(error.constraints || {}).forEach(constraint => {
                    validationErrorCounter.inc({
                        field: error.property,
                        error_type: constraint,
                        endpoint: 'unknown'
                    });
                });
            });
            this.logger.warn('Validation failed', {
                errors: errors.map(error => ({
                    field: error.property,
                    constraints: error.constraints,
                    value: error.value
                }))
            });
            const formattedErrors = this.formatValidationErrors(errors);
            throw new BadRequestException({
                message: 'Validation failed',
                errors: formattedErrors,
                timestamp: new Date().toISOString(),
                error: 'VALIDATION_ERROR'
            });
        }
        return object;
    }
    toValidate(metatype) {
        const types = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }
    formatValidationErrors(errors) {
        return errors.map(error => ({
            field: error.property,
            value: error.value,
            constraints: error.constraints,
            children: error.children ? this.formatValidationErrors(error.children) : undefined
        }));
    }
};
ValidationPipe = ValidationPipe_1 = __decorate([
    Injectable()
], ValidationPipe);
export { ValidationPipe };
//# sourceMappingURL=validation.pipe.js.map