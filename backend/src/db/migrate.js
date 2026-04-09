import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { query, closePool } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
    console.log('🚀 Starting database migration...\n');

    try {
        // Read schema file
        const schemaPath = join(__dirname, 'schema.sql');
        const schema = readFileSync(schemaPath, 'utf-8');

        // Execute schema
        await query(schema);

        console.log('\n✅ Database migration completed successfully!');
        console.log('📋 Created tables:');
        console.log('   - visitors');
        console.log('   - contact_submissions');
        console.log('   - careers');
        console.log('   - admin_users');
        console.log('   - refresh_tokens');
        console.log('   - site_content');
        console.log('   - login_attempts');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await closePool();
    }
}

migrate();
