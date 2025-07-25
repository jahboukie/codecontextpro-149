"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const readline = __importStar(require("readline"));
const licenseManager_js_1 = require("../services/licenseManager.js");
async function activateLicense(email, licenseKey) {
    try {
        // In production, this would call your license server API
        // For demo purposes, we'll create a valid license
        console.log('🔐 Activating license...');
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Generate machine fingerprint
        const machineFingerprint = licenseManager_js_1.LicenseManager.generateMachineFingerprint();
        // Create license (in production, this would come from the server)
        const license = licenseManager_js_1.LicenseManager.createLicense(email, 'annual', machineFingerprint);
        // Save license locally
        licenseManager_js_1.LicenseManager.saveLicense(license);
        console.log('✅ License activated successfully!');
        console.log(`📧 Email: ${license.email}`);
        console.log(`📅 Plan: ${license.plan}`);
        console.log(`⏰ Expires: ${new Date(license.expiryDate).toLocaleDateString()}`);
        return { success: true, license };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
function createLicenseCommand() {
    const cmd = new commander_1.Command('license');
    cmd.description('Manage CodeContext Pro license');
    cmd.command('activate')
        .description('Activate your CodeContext Pro license')
        .action(async () => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        try {
            console.log('╔══════════════════════════════════════════════════════════════╗');
            console.log('║                🔐 CodeContext Pro License Activation        ║');
            console.log('╚══════════════════════════════════════════════════════════════╝');
            console.log();
            const email = await new Promise((resolve) => {
                rl.question('📧 Enter your email address: ', resolve);
            });
            const licenseKey = await new Promise((resolve) => {
                rl.question('🔑 Enter your license key: ', resolve);
            });
            console.log();
            const result = await activateLicense(email, licenseKey);
            if (!result.success) {
                console.error('❌ License activation failed:', result.error);
                process.exit(1);
            }
        }
        finally {
            rl.close();
        }
    });
    cmd.command('status')
        .description('Check license status')
        .action(() => {
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║                🔐 CodeContext Pro License Status            ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log();
        const validation = licenseManager_js_1.LicenseManager.validateLicense();
        if (!validation.valid) {
            console.log('❌ License Status: INVALID');
            console.log('🔍 Reason:', validation.reason);
            if (validation.reason === 'No license found') {
                console.log();
                console.log('💡 To activate your license, run: codecontext-pro license activate');
                console.log('💡 For a 7-day trial, run: codecontext-pro license trial');
            }
            return;
        }
        const license = validation.license;
        const daysUntilExpiry = licenseManager_js_1.LicenseManager.getDaysUntilExpiry(license);
        const isTrialLicense = licenseManager_js_1.LicenseManager.isTrialLicense(license);
        console.log('✅ License Status: VALID');
        console.log('📧 Email:', license.email);
        console.log('📅 Plan:', license.plan.toUpperCase());
        console.log('⏰ Expires:', new Date(license.expiryDate).toLocaleDateString());
        console.log('📊 Days remaining:', daysUntilExpiry);
        console.log('🔐 Machine ID:', license.machineFingerprint.substring(0, 8) + '...');
        if (isTrialLicense) {
            console.log('🚨 Trial License - Upgrade to continue using after expiry');
        }
        console.log('🎯 Features:', license.features.join(', '));
    });
    cmd.command('trial')
        .description('Start a 7-day free trial')
        .action(() => {
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║                🚀 CodeContext Pro Free Trial                ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log();
        // Check if there's already a valid license
        const validation = licenseManager_js_1.LicenseManager.validateLicense();
        if (validation.valid) {
            console.log('✅ You already have a valid license!');
            return;
        }
        console.log('🎉 Starting your 7-day free trial...');
        const trialLicense = licenseManager_js_1.LicenseManager.getTrialLicense();
        licenseManager_js_1.LicenseManager.saveLicense(trialLicense);
        console.log('✅ Trial activated successfully!');
        console.log('⏰ Your trial expires on:', new Date(trialLicense.expiryDate).toLocaleDateString());
        console.log('🎯 All features are unlocked during the trial period');
        console.log();
        console.log('💡 To purchase a full license, visit: https://codecontext.pro/pricing');
    });
    cmd.command('deactivate')
        .description('Deactivate current license')
        .action(() => {
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║                🔐 License Deactivation                      ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log();
        const validation = licenseManager_js_1.LicenseManager.validateLicense();
        if (!validation.valid) {
            console.log('❌ No active license found to deactivate');
            return;
        }
        licenseManager_js_1.LicenseManager.removeLicense();
        console.log('✅ License deactivated successfully');
        console.log('💡 You can reactivate anytime with: codecontext-pro license activate');
    });
    return cmd;
}
exports.default = createLicenseCommand;
//# sourceMappingURL=license.js.map