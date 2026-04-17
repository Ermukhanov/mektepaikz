#!/usr/bin/env node
/**
 * Telegram Bot Setup Script
 * Запуск: node scripts/setup-telegram.js
 * 
 * Настраивает Telegram бота и webhook для приема сообщений
 */

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🤖 MEKTEP AI - Telegram Bot Setup\n');

  const botToken = await question('Enter your Telegram Bot Token: ');
  const webhookUrl = await question(
    'Enter your webhook URL (e.g., https://your-domain.com/api/telegram/webhook): '
  );

  if (!botToken || !webhookUrl) {
    console.error('❌ Bot token and webhook URL are required');
    process.exit(1);
  }

  console.log('\n⏳ Setting up webhook...\n');

  try {
    // Set webhook
    await makeRequest('https://api.telegram.org/bot' + botToken + '/setWebhook', {
      url: webhookUrl,
    });

    console.log('✅ Webhook set successfully!');

    // Get bot info
    const info = await makeRequest('https://api.telegram.org/bot' + botToken + '/getMe');
    console.log(`\n📱 Bot Information:`);
    console.log(`   Name: ${info.result.first_name}`);
    console.log(`   Username: @${info.result.username}`);
    console.log(`   ID: ${info.result.id}`);

    // Get webhook info
    const webhookInfo = await makeRequest(
      'https://api.telegram.org/bot' + botToken + '/getWebhookInfo'
    );
    console.log(`\n🔗 Webhook Information:`);
    console.log(`   URL: ${webhookInfo.result.url}`);
    console.log(`   Status: ${webhookInfo.result.has_custom_certificate ? 'OK' : 'Pending'}`);
    console.log(`   Pending updates: ${webhookInfo.result.pending_update_count}`);

    console.log('\n✨ Setup complete! The bot is ready to receive messages.');
    console.log(`\nTest the bot by sending a message to @${info.result.username}`);

    // Save config
    const fs = require('fs');
    const config = {
      bot_token: botToken,
      webhook_url: webhookUrl,
      bot_username: info.result.username,
      bot_id: info.result.id,
      setup_date: new Date().toISOString(),
    };

    fs.writeFileSync('.telegram-config.json', JSON.stringify(config, null, 2));
    console.log('\n📝 Config saved to .telegram-config.json');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }

  rl.close();
}

function makeRequest(url, params) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(params);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(url, options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

main().catch(console.error);
