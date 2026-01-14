const bcrypt = require('bcryptjs');
const { pool } = require('./db');

const seedDb = async () => {
  try {
    console.log('Seeding database...');

    // Create test users
    const caregiverHash = await bcrypt.hash('password123', 10);
    const staffHash = await bcrypt.hash('password123', 10);

    // Insert caregiver user
    const caregiver = await pool.query(
      'INSERT INTO users (email, password_hash, user_type, name) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id',
      ['caregiver@test.com', caregiverHash, 'caregiver', 'John Smith']
    );

    // Insert staff user
    const staff = await pool.query(
      'INSERT INTO users (email, password_hash, user_type, name) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id',
      ['staff@test.com', staffHash, 'staff', 'Jane Doe']
    );

    const caregiver_id = caregiver.rows[0]?.id || 1;
    const staff_id = staff.rows[0]?.id || 2;

    // Insert individuals
    const ind1 = await pool.query(
      'INSERT INTO individuals (caregiver_id, name, age, special_needs) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id',
      [caregiver_id, 'Alex Johnson', 15, 'Likes sports and outdoor activities']
    );

    const ind2 = await pool.query(
      'INSERT INTO individuals (caregiver_id, name, age, special_needs) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id',
      [caregiver_id, 'Sarah Johnson', 18, 'Enjoys art and creative activities']
    );

    const ind3 = await pool.query(
      'INSERT INTO individuals (caregiver_id, name, age, special_needs) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id',
      [caregiver_id, 'Michael Johnson', 16, 'Music enthusiast']
    );

    const ind1_id = ind1.rows[0]?.id || 1;
    const ind2_id = ind2.rows[0]?.id || 2;
    const ind3_id = ind3.rows[0]?.id || 3;

    // Insert activities
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    await pool.query(
      'INSERT INTO activities (title, description, date, time, location, capacity) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
      [
        'Basketball Training',
        'Fun basketball session for all skill levels',
        tomorrow.toISOString().split('T')[0],
        '14:00',
        'MINDS Community Center',
        20
      ]
    );

    await pool.query(
      'INSERT INTO activities (title, description, date, time, location, capacity) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
      [
        'Art Workshop',
        'Creative art class with painting and drawing',
        nextWeek.toISOString().split('T')[0],
        '10:00',
        'MINDS Studio',
        15
      ]
    );

    await pool.query(
      'INSERT INTO activities (title, description, date, time, location, capacity) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
      [
        'Music Jam Session',
        'Play instruments and create music together',
        nextWeek.toISOString().split('T')[0],
        '16:00',
        'MINDS Music Hall',
        12
      ]
    );

    console.log('Database seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('Caregiver - Email: caregiver@test.com, Password: password123');
    console.log('Staff - Email: staff@test.com, Password: password123');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDb();