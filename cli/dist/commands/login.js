"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginCommand = loginCommand;
exports.logoutCommand = logoutCommand;
const chalk_1 = __importDefault(require("chalk"));
async function loginCommand() {
    console.log(chalk_1.default.green('✅ CodeContext Pro Developer Edition'));
    console.log(chalk_1.default.gray('Local development mode - no authentication required\n'));
    console.log(chalk_1.default.blue('🚀 Ready to use CodeContext Pro commands!'));
    console.log(chalk_1.default.gray('Try: codecontext status'));
}
async function logoutCommand() {
    console.log(chalk_1.default.gray('Developer Edition - no logout needed'));
    console.log(chalk_1.default.green('✅ Always ready to use!'));
}
//# sourceMappingURL=login.js.map