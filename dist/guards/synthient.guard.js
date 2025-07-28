var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
export function checkIntent(input) {
    return !input.includes('harm') && !input.includes('destroy');
}
let SynthientGuard = class SynthientGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const body = request.body;
        const query = request.query;
        const params = request.params;
        const inputData = JSON.stringify({ body, query, params });
        return checkIntent(inputData);
    }
};
SynthientGuard = __decorate([
    Injectable()
], SynthientGuard);
export { SynthientGuard };
//# sourceMappingURL=synthient.guard.js.map