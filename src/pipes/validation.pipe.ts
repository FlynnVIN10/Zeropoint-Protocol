import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, Logger } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Counter } from 'prom-client';

// Prometheus metrics for validation
const validationErrorCounter = new Counter({
  name: 'validation_errors_total',
  help: 'Total validation errors by field and type',
  labelNames: ['field', 'error_type', 'endpoint']
});

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  private readonly logger = new Logger(ValidationPipe.name);

  async transform(value: any, { metatype }: ArgumentMetadata) {
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
      // Record validation errors in Prometheus
      errors.forEach(error => {
        Object.keys(error.constraints || {}).forEach(constraint => {
          validationErrorCounter.inc({
            field: error.property,
            error_type: constraint,
            endpoint: 'unknown' // Will be set by interceptor
          });
        });
      });

      // Log validation errors
      this.logger.warn('Validation failed', {
        errors: errors.map(error => ({
          field: error.property,
          constraints: error.constraints,
          value: error.value
        }))
      });

      // Format validation error response
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

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatValidationErrors(errors: any[]): any[] {
    return errors.map(error => ({
      field: error.property,
      value: error.value,
      constraints: error.constraints,
      children: error.children ? this.formatValidationErrors(error.children) : undefined
    }));
  }
} 