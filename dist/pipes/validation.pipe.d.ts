import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export declare class ValidationPipe implements PipeTransform<any> {
    private readonly logger;
    transform(value: any, { metatype }: ArgumentMetadata): Promise<any>;
    private toValidate;
    private formatValidationErrors;
}
