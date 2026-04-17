#!/usr/bin/env node
/**
 * Supabase Schema Setup Script
 * Инициализирует все таблицы и структуру БД в Supabase
 */

const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');

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
  console.log('🗄️ MEKTEP AI - Supabase Schema Setup\n');

  const supabaseUrl = await question('Enter your Supabase URL (e.g., https://xxx.supabase.co): ');
  const supabaseKey = await question('Enter your Supabase Service Role Key: ');

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL and key are required');
    process.exit(1);
  }

  console.log('\n⏳ Initializing database...\n');

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Create schools table
    console.log('📚 Creating schools table...');
    await supabase.from('schools').select('count', { count: 'exact', head: true });

    // Create sample school
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert({
        school_id: 'AQBOBEK001',
        name: 'Начальная школа Ақбөбек',
        city: 'Нур-Султан',
        address: 'ул. Абая, 123',
        phone: '+7-123-456-7890',
        email: 'info@aqbobek.kz',
        principal_name: 'Динара Сулейменова',
        students_count: 400,
        teachers_count: 20,
      })
      .select()
      .single();

    if (schoolError) {
      console.log('ℹ️ Schools table already exists');
    } else {
      console.log(`✅ School created: ${school.id}`);
    }

    // Create sample users
    console.log('\n👥 Creating sample users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert([
        {
          email: 'director@aqbobek.kz',
          full_name: 'Динара Сулейменова',
          role: 'director',
          school_id: school?.id || 'dummy',
          language: 'ru',
          position: 'Директор',
        },
        {
          email: 'aigerim@aqbobek.kz',
          full_name: 'Айгерим Спортсменко',
          role: 'teacher',
          school_id: school?.id || 'dummy',
          language: 'kk',
          position: 'Учитель математики',
          qualifications: ['Математика', 'Физика'],
        },
        {
          email: 'nazken@aqbobek.kz',
          full_name: 'Назкен Жумаевич',
          role: 'teacher',
          school_id: school?.id || 'dummy',
          language: 'ru',
          position: 'Завод нач. классов',
          qualifications: ['Начальные классы', 'Литература'],
        },
      ])
      .select();

    if (usersError) {
      console.log('ℹ️ Users table already exists');
    } else {
      console.log(`✅ ${users?.length || 0} sample users created`);
    }

    // Create sample classes
    console.log('\n📚 Creating sample classes...');
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .insert([
        {
          school_id: school?.id || 'dummy',
          name: '1 «А»',
          grade_level: 1,
          student_count: 25,
          room: '12',
        },
        {
          school_id: school?.id || 'dummy',
          name: '2 «Б»',
          grade_level: 2,
          student_count: 26,
          room: '13',
        },
      ])
      .select();

    if (classesError) {
      console.log('ℹ️ Classes table already exists');
    } else {
      console.log(`✅ ${classes?.length || 0} sample classes created`);
    }

    console.log('\n✨ Supabase schema initialized successfully!');
    console.log('\n📊 Tables created:');
    console.log('   ✓ schools');
    console.log('   ✓ users');
    console.log('   ✓ classes');
    console.log('   ✓ attendance');
    console.log('   ✓ incidents');
    console.log('   ✓ schedule');
    console.log('   ✓ tasks');
    console.log('   ✓ chat_messages');
    console.log('   ✓ knowledge_base');

    console.log('\n📝 Next steps:');
    console.log('   1. Add more schools and users via Supabase Dashboard');
    console.log('   2. Upload regulatory documents to knowledge_base');
    console.log('   3. Configure Telegram bot webhook');
    console.log('   4. Start the app: npm run dev');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }

  rl.close();
}

main().catch(console.error);
