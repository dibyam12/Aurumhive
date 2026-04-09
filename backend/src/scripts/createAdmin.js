import bcrypt from 'bcrypt';
import readline from 'readline';
import { query, closePool } from '../db/connection.js';

const SALT_ROUNDS = 12;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const prompt = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
};

async function createAdmin() {
    console.log('\n🔐 Create Admin User\n');
    console.log('─'.repeat(40));

    try {
        // Get username
        const username = await prompt('Username: ');
        if (!username || username.length < 3) {
            console.error('❌ Username must be at least 3 characters');
            process.exit(1);
        }

        // Check if username exists
        const existing = await query(
            'SELECT id FROM admin_users WHERE username = $1',
            [username]
        );

        if (existing.rows.length > 0) {
            console.error('❌ Username already exists');
            process.exit(1);
        }

        // Get email (optional)
        const email = await prompt('Email (optional): ');

        // Get password
        const password = await prompt('Password (min 8 chars): ');
        if (!password || password.length < 8) {
            console.error('❌ Password must be at least 8 characters');
            process.exit(1);
        }

        // Confirm password
        const confirmPassword = await prompt('Confirm Password: ');
        if (password !== confirmPassword) {
            console.error('❌ Passwords do not match');
            process.exit(1);
        }

        // Hash password
        console.log('\n📝 Creating admin user...');
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert admin user
        const result = await query(
            `INSERT INTO admin_users (username, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, username, email, created_at`,
            [username, email || null, passwordHash]
        );

        console.log('\n✅ Admin user created successfully!');
        console.log('─'.repeat(40));
        console.log(`   ID: ${result.rows[0].id}`);
        console.log(`   Username: ${result.rows[0].username}`);
        if (result.rows[0].email) {
            console.log(`   Email: ${result.rows[0].email}`);
        }
        console.log(`   Created: ${result.rows[0].created_at}`);
        console.log('─'.repeat(40));
        console.log('\n🎉 You can now login to the admin dashboard!\n');

    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    } finally {
        rl.close();
        await closePool();
    }
}

createAdmin();
