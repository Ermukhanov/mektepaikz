#!/usr/bin/env node
/**
 * Local Development Setup
 * Быстрая настройка всех компонентов для локальной разработки
 * 
 * Использование:
 * npm run setup:dev
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 MEKTEP AI - Local Development Setup\n');

// 1. Check Node.js version
console.log('✓ Checking Node.js version...');
const nodeVersion = process.version;
console.log(`  Using Node.js ${nodeVersion}\n`);

// 2. Create .env.local if not exists
console.log('✓ Setting up environment variables...');
const envPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envPath)) {
  const envTemplate = `# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-your-key-here

# Telegram Bot Configuration
VITE_TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
VITE_TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook

# Application Settings
VITE_APP_URL=http://localhost:5173
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('  ✓ Created .env.local (please update with your credentials)');
} else {
  console.log('  ✓ .env.local already exists');
}

// 3. Check dependencies
console.log('\n✓ Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json')));
console.log(`  Total dependencies: ${Object.keys(packageJson.dependencies).length}`);

// 4. Create dirs if needed
const dirs = [
  'supabase/migrations',
  'scripts',
  'src/routes/api',
];

dirs.forEach((dir) => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`  ✓ Created directory: ${dir}`);
  }
});

console.log('\n✨ Setup Complete!\n');

console.log('📝 Next Steps:');
console.log('   1. Update .env.local with your credentials:');
console.log('      - Supabase URL & Key');
console.log('      - OpenAI API Key');
console.log('      - Telegram Bot Token');
console.log('');
console.log('   2. Initialize database:');
console.log('      npm run setup:supabase');
console.log('');
console.log('   3. Setup Telegram bot:');
console.log('      npm run setup:telegram');
console.log('');
console.log('   4. Start development server:');
console.log('      npm run dev');
console.log('');
console.log('📚 Documentation at: ./README.md');
console.log('');
