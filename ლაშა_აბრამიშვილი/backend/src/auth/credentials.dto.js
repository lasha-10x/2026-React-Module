var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength } from 'class-validator';
class EmailDto {
    email;
}
__decorate([
    Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value),
    IsString(),
    IsEmail({ allow_utf8_local_part: false }),
    MaxLength(254)
], EmailDto.prototype, "email", void 0);
export class CredentialsDto extends EmailDto {
    password;
}
__decorate([
    IsString()
    // Accept new registrations by code point count and preserve the legacy upper bound.
    ,
    Matches(/^[\s\S]{12}/u),
    MaxLength(128)
], CredentialsDto.prototype, "password", void 0);
export class RegistrationCredentialsDto extends EmailDto {
    password;
}
__decorate([
    IsString(),
    Matches(/^[^\s\p{White_Space}]{12,128}$/u)
], RegistrationCredentialsDto.prototype, "password", void 0);
