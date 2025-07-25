interface LicenseInfo {
    email: string;
    plan: 'annual' | 'monthly';
    expiryDate: string;
    machineFingerprint: string;
    features: string[];
    issued: string;
    signature: string;
}
export declare class LicenseManager {
    private static readonly LICENSE_FILE;
    private static readonly SECRET_KEY;
    private static readonly MAX_MACHINES;
    static generateMachineFingerprint(): string;
    static signLicense(licenseData: Omit<LicenseInfo, 'signature'>): string;
    static verifyLicenseSignature(licenseInfo: LicenseInfo): boolean;
    static createLicense(email: string, plan: 'annual' | 'monthly', machineFingerprint: string): LicenseInfo;
    static saveLicense(licenseInfo: LicenseInfo): void;
    static loadLicense(): LicenseInfo | null;
    static validateLicense(): {
        valid: boolean;
        reason?: string;
        license?: LicenseInfo;
    };
    static validateLicenseOnline(license: LicenseInfo): Promise<{
        valid: boolean;
        reason?: string;
    }>;
    static getTrialLicense(): LicenseInfo;
    static isTrialLicense(license: LicenseInfo): boolean;
    static getDaysUntilExpiry(license: LicenseInfo): number;
    static removeLicense(): void;
}
export {};
//# sourceMappingURL=licenseManager.d.ts.map