"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderEnum = exports.UserOTPEnum = exports.GenderEnum = exports.RoleEnum = void 0;
var RoleEnum;
(function (RoleEnum) {
    RoleEnum[RoleEnum["User"] = 0] = "User";
    RoleEnum[RoleEnum["Admin"] = 1] = "Admin";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
var GenderEnum;
(function (GenderEnum) {
    GenderEnum[GenderEnum["Male"] = 0] = "Male";
    GenderEnum[GenderEnum["Female"] = 1] = "Female";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var UserOTPEnum;
(function (UserOTPEnum) {
    UserOTPEnum["ConfirmEmail"] = "ConfirmEmail";
    UserOTPEnum["ForgetPassword"] = "ForgetPassword";
})(UserOTPEnum || (exports.UserOTPEnum = UserOTPEnum = {}));
var ProviderEnum;
(function (ProviderEnum) {
    ProviderEnum[ProviderEnum["System"] = 0] = "System";
    ProviderEnum[ProviderEnum["Google"] = 1] = "Google";
})(ProviderEnum || (exports.ProviderEnum = ProviderEnum = {}));
