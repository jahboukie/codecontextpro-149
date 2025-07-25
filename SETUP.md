# CodeContext Pro Developer Edition Setup

## Prerequisites

### 1. PostgreSQL Installation

Install PostgreSQL on your Windows machine:

1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Install with default settings
3. Remember the password you set for the `postgres` user
4. Ensure PostgreSQL service is running

### 2. Database Setup

Create the development database:

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE codecontext_pro_dev;
```

Or use pgAdmin 4:
1. Open pgAdmin 4
2. Connect to your PostgreSQL server
3. Right-click "Databases" → "Create" → "Database"
4. Name: `codecontext_pro_dev`

### 3. Configuration

The default PostgreSQL configuration in the code is:
```javascript
{
  host: 'localhost',
  port: 5432,
  database: 'codecontext_pro_dev',
  user: 'postgres',
  password: 'postgres'
}
```

If your PostgreSQL setup is different, update the credentials in:
`cli/src/services/memoryEngine.ts` (line 7-13)

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
cd cli && npm install
cd ../execution-engine && npm install
```

3. Build the project:
```bash
cd cli && npm run build
cd ../execution-engine && npm run build
```

4. Install globally:
```bash
cd cli && npm link
```

## Usage

1. Navigate to any project directory
2. Initialize CodeContext Pro:
```bash
codecontext-pro init
```

3. Check status:
```bash
codecontext-pro status
```

4. Use memory features:
```bash
codecontext-pro memory --help
```

5. Execute code:
```bash
codecontext-pro execute --help
```

## Troubleshooting

### PostgreSQL Connection Issues

If you see "password authentication failed":
1. Check that PostgreSQL is running
2. Verify your postgres user password
3. Update the password in `cli/src/services/memoryEngine.ts`
4. Rebuild: `cd cli && npm run build`

### Permission Issues

If you see permission errors:
1. Run terminal as administrator
2. Or install in user directory instead of global

## Features

✅ **Memory Engine**: Persistent conversation and decision tracking  
✅ **Execution Engine**: Sandboxed code execution  
✅ **PostgreSQL Backend**: Reliable database storage  
✅ **No Limits**: Unlimited usage for local development  
✅ **No Authentication**: No API keys or subscriptions needed  

## WSL2 Usage

This tool works in WSL2. Make sure:
1. PostgreSQL is accessible from WSL2 (usually via Windows host IP)
2. Update the host in memoryEngine.ts to your Windows IP if needed
3. Ensure Windows firewall allows PostgreSQL connections