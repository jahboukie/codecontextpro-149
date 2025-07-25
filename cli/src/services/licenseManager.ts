import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface LicenseInfo {
  email: string;
  plan: 'annual' | 'monthly';
  expiryDate: string;
  machineFingerprint: string;
  features: string[];
  issued: string;
  signature: string;
}

interface MachineInfo {
  hostname: string;
  platform: string;
  arch: string;
  cpus: string;
  networkInterfaces: string;
}

export class LicenseManager {
  private static readonly LICENSE_FILE = '.codecontext-license';
  private static readonly SECRET_KEY = process.env.CODECONTEXT_LICENSE_KEY || 'cc-pro-2025-secure-key';
  private static readonly MAX_MACHINES = 3; // Maximum machines per license

  static generateMachineFingerprint(): string {
    const machineInfo: MachineInfo = {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      cpus: JSON.stringify(os.cpus().map(cpu => cpu.model)),
      networkInterfaces: JSON.stringify(os.networkInterfaces())
    };

    const fingerprint = crypto
      .createHash('sha256')
      .update(JSON.stringify(machineInfo))
      .digest('hex');

    return fingerprint.substring(0, 32); // First 32 characters
  }

  static signLicense(licenseData: Omit<LicenseInfo, 'signature'>): string {
    const dataToSign = JSON.stringify(licenseData);
    return crypto
      .createHmac('sha256', this.SECRET_KEY)
      .update(dataToSign)
      .digest('hex');
  }

  static verifyLicenseSignature(licenseInfo: LicenseInfo): boolean {
    const { signature, ...dataToVerify } = licenseInfo;
    const expectedSignature = this.signLicense(dataToVerify);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  static createLicense(email: string, plan: 'annual' | 'monthly', machineFingerprint: string): LicenseInfo {
    const now = new Date();
    const expiryDate = new Date(now);
    
    if (plan === 'annual') {
      expiryDate.setFullYear(now.getFullYear() + 1);
    } else {
      expiryDate.setMonth(now.getMonth() + 1);
    }

    const licenseData: Omit<LicenseInfo, 'signature'> = {
      email,
      plan,
      expiryDate: expiryDate.toISOString(),
      machineFingerprint,
      features: ['memory', 'execution', 'unlimited'],
      issued: now.toISOString()
    };

    const signature = this.signLicense(licenseData);

    return {
      ...licenseData,
      signature
    };
  }

  static saveLicense(licenseInfo: LicenseInfo): void {
    const licenseFilePath = path.join(os.homedir(), this.LICENSE_FILE);
    
    // Encrypt the license data
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.SECRET_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(licenseInfo), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const encryptedData = iv.toString('hex') + ':' + encrypted;

    fs.writeFileSync(licenseFilePath, encryptedData, { mode: 0o600 }); // Restrict file permissions
  }

  static loadLicense(): LicenseInfo | null {
    try {
      const licenseFilePath = path.join(os.homedir(), this.LICENSE_FILE);
      
      if (!fs.existsSync(licenseFilePath)) {
        return null;
      }

      const encryptedData = fs.readFileSync(licenseFilePath, 'utf8');
      
      // Decrypt the license data
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(this.SECRET_KEY, 'salt', 32);
      const [ivHex, encrypted] = encryptedData.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted) as LicenseInfo;
    } catch (error) {
      console.error('Error loading license:', error);
      return null;
    }
  }

  static validateLicense(): { valid: boolean; reason?: string; license?: LicenseInfo } {
    const license = this.loadLicense();
    
    if (!license) {
      return { valid: false, reason: 'No license found' };
    }

    // Verify signature
    if (!this.verifyLicenseSignature(license)) {
      return { valid: false, reason: 'Invalid license signature' };
    }

    // Check expiry
    const now = new Date();
    const expiryDate = new Date(license.expiryDate);
    if (now > expiryDate) {
      return { valid: false, reason: 'License expired', license };
    }

    // Verify machine fingerprint
    const currentFingerprint = this.generateMachineFingerprint();
    if (license.machineFingerprint !== currentFingerprint) {
      return { valid: false, reason: 'License not valid for this machine', license };
    }

    return { valid: true, license };
  }

  static async validateLicenseOnline(license: LicenseInfo): Promise<{ valid: boolean; reason?: string }> {
    // In production, this would make an API call to your license server
    // For now, we'll simulate online validation
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if license is revoked (this would be a real API call)
      const revokedLicenses: string[] = []; // This would come from your license server
      
      if (revokedLicenses.includes(license.signature)) {
        return { valid: false, reason: 'License has been revoked' };
      }

      return { valid: true };
    } catch (error) {
      // If online validation fails, allow offline validation to proceed
      console.warn('Online license validation failed, proceeding with offline validation');
      return { valid: true };
    }
  }

  static getTrialLicense(): LicenseInfo {
    const machineFingerprint = this.generateMachineFingerprint();
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(now.getDate() + 7); // 7-day trial

    const licenseData: Omit<LicenseInfo, 'signature'> = {
      email: 'trial@codecontext.pro',
      plan: 'annual',
      expiryDate: expiryDate.toISOString(),
      machineFingerprint,
      features: ['memory', 'execution', 'trial'],
      issued: now.toISOString()
    };

    const signature = this.signLicense(licenseData);

    return {
      ...licenseData,
      signature
    };
  }

  static isTrialLicense(license: LicenseInfo): boolean {
    return license.email === 'trial@codecontext.pro' || license.features.includes('trial');
  }

  static getDaysUntilExpiry(license: LicenseInfo): number {
    const now = new Date();
    const expiryDate = new Date(license.expiryDate);
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static removeLicense(): void {
    const licenseFilePath = path.join(os.homedir(), this.LICENSE_FILE);
    if (fs.existsSync(licenseFilePath)) {
      fs.unlinkSync(licenseFilePath);
    }
  }
}