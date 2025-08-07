const { Pool } = require('pg');
const argon2 = require('argon2');
require('dotenv').config();

async function createAdminUser() {
  // Create a connection pool
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'propertylinqs',
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  const client = await pool.connect();

  try {
    console.log('Connected to database');
    
    // Start transaction
    await client.query('BEGIN');
    
    // 1. Check if tenant exists
    const tenantResult = await client.query(
      'SELECT id FROM tenant WHERE name = $1',
      ['PropertyLinqs']
    );
    
    let tenantId;
    
    if (tenantResult.rows.length === 0) {
      // Create tenant
      const newTenantResult = await client.query(
        'INSERT INTO tenant (name, email, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING id',
        ['PropertyLinqs', 'admin@propertylinqs.com']
      );
      tenantId = newTenantResult.rows[0].id;
      console.log('Created new tenant with ID:', tenantId);
    } else {
      tenantId = tenantResult.rows[0].id;
      console.log('Using existing tenant with ID:', tenantId);
    }
    
    // 2. Check if admin user exists
    const userResult = await client.query(
      'SELECT id, user_info_id FROM "user" WHERE email = $1',
      ['admin@propertylinqs.com']
    );
    
    // If user exists, delete it and its related records
    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;
      const userInfoId = userResult.rows[0].user_info_id;
      
      // Delete user roles
      await client.query('DELETE FROM user_role WHERE user_id = $1', [userId]);
      console.log('Deleted existing user roles');
      
      // Delete user
      await client.query('DELETE FROM "user" WHERE id = $1', [userId]);
      console.log('Deleted existing user');
      
      // Delete user info
      await client.query('DELETE FROM user_info WHERE id = $1', [userInfoId]);
      console.log('Deleted existing user info');
    }
    
    // 3. Create new user info
    const userInfoResult = await client.query(
      'INSERT INTO user_info (first_name, last_name, avatar, sex, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
      ['Admin', 'User', '', '']
    );
    const userInfoId = userInfoResult.rows[0].id;
    console.log('Created user info with ID:', userInfoId);
    
    // 4. Create new user with hashed password
    // Generate password hash for 'admin123'
    const hashedPassword = await argon2.hash('admin123');
    
    const userResult2 = await client.query(
      'INSERT INTO "user" (email, password, user_info_id, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id',
      ['admin@propertylinqs.com', hashedPassword, userInfoId]
    );
    const userId = userResult2.rows[0].id;
    console.log('Created user with ID:', userId);
    
    // 5. Create user role
    await client.query(
      'INSERT INTO user_role (role, user_id, tenant_id) VALUES ($1, $2, $3)',
      ['admin', userId, tenantId]
    );
    console.log('Created admin role for user');
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Admin user created successfully');
    console.log('Login credentials:');
    console.log('Email: admin@propertylinqs.com');
    console.log('Password: admin123');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating admin user:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createAdminUser(); 