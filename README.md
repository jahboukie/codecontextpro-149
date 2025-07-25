# CodeContext Pro - Developer Edition

## 🚀 Complete AI Cognitive Upgrades System

This is the **Developer Edition** of CodeContext Pro with unlimited access and all developer tools included.

## 📁 Project Structure

```
codecontext-pro-developer-edition/
├── cli/                    # Client-side CLI tool
│   ├── src/               # CLI source code
│   ├── package.json       # CLI dependencies
│   └── .env.local         # CLI environment config
├── backend/               # Server-side Firebase Functions
│   ├── src/               # Backend API source code
│   ├── lib/               # Compiled backend code
│   ├── package.json       # Backend dependencies
│   └── .env.local         # Backend environment config
├── execution-engine/      # Code execution engine
│   ├── src/               # Execution engine source
│   └── sandbox/           # Sandboxed execution environment
├── codecontext-dev/       # Development utilities
├── .env.local             # Root environment configuration
├── firebase.json          # Firebase deployment config
├── package.json           # Root package configuration
├── install.ps1            # Windows installation script
└── install.sh             # Unix installation script
```

## 🔧 Installation

### Windows (PowerShell)
```powershell
.\install.ps1
```

### Unix/Linux/Mac
```bash
chmod +x install.sh
./install.sh
```

## 🎯 Features

- **✅ Unlimited Executions** - No usage limits
- **✅ Unlimited File Tracking** - Track any number of files
- **✅ Advanced Pattern Recognition** - Learn from your coding patterns
- **✅ Persistent Memory** - Never lose context across sessions
- **✅ Secure Authentication** - Firebase-based user management
- **✅ Payment Integration** - Stripe-powered subscription management
- **✅ Real-time Validation** - Server-side usage validation
- **✅ Device Management** - Multi-device activation support

## 🚀 Quick Start

1. **Install the CLI:**
   ```bash
   npm install -g codecontext-pro
   ```

2. **Activate your license:**
   ```bash
   codecontext-pro activate <your-access-key>
   ```

3. **Start using:**
   ```bash
   codecontext-pro execute "console.log('Hello CodeContext Pro!')"
   ```

## 🔐 Environment Configuration

The system uses multiple environment files:
- **Root `.env.local`** - Global configuration
- **CLI `.env.local`** - Client-side settings
- **Backend `.env.local`** - Server-side settings

## 🛠️ Development

### Deploy Backend Functions
```bash
firebase deploy --only functions
```

### Build CLI
```bash
cd cli && npm run build
```

### Run Execution Engine
```bash
cd execution-engine && npm start
```

## 📞 Support

For developer support and advanced configuration, contact the development team.

---

**CodeContext Pro Developer Edition** - Transforming AI coding assistants from goldfish mode to persistent development partners.
