#!/usr/bin/env node

/**
 * Database Migration Script
 * 
 * This script helps migrate from the in-memory storage system to Prisma + PostgreSQL
 * 
 * Usage:
 * 1. Ensure your DATABASE_URL is set in .env
 * 2. Run: node scripts/migrate-database.js
 */

const { PrismaClient } = require('@prisma/client');
const { initializeDefaultSizeCharts } = require('../lib/sizeRecommendation');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🚀 Starting PhotoAI Pro database migration...\n');

    // Test database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Run Prisma migrations
    console.log('2. Running Prisma migrations...');
    console.log('   Run: npx prisma migrate dev --name init');
    console.log('   Or: npx prisma migrate deploy (for production)\n');

    // Initialize default size charts
    console.log('3. Initializing default size charts...');
    try {
      await initializeDefaultSizeCharts();
      console.log('✅ Default size charts created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Size charts already exist, skipping...\n');
      } else {
        throw error;
      }
    }

    // Verify schema
    console.log('4. Verifying database schema...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const expectedTables = ['Customer', 'Photo', 'BodyMeasurements', 'ShopifyOrder', 'SizeChart', 'SizeRecommendation'];
    const existingTables = tables.map(t => t.table_name);
    
    console.log('   Existing tables:', existingTables.join(', '));
    
    const missingTables = expectedTables.filter(table => 
      !existingTables.some(existing => existing.toLowerCase() === table.toLowerCase())
    );
    
    if (missingTables.length > 0) {
      console.log('⚠️  Missing tables:', missingTables.join(', '));
      console.log('   Please run Prisma migrations first.');
    } else {
      console.log('✅ All required tables exist\n');
    }

    // Show next steps
    console.log('🎉 Migration preparation complete!\n');
    console.log('Next steps:');
    console.log('1. Run Prisma migrations: npx prisma migrate dev');
    console.log('2. Generate Prisma client: npx prisma generate');
    console.log('3. Update your environment variables:');
    console.log('   - DATABASE_URL (PostgreSQL connection string)');
    console.log('   - SHOPIFY_SHOP_DOMAIN (optional)');
    console.log('   - SHOPIFY_ACCESS_TOKEN (optional)');
    console.log('   - N8N_WEBHOOK_URL (optional)');
    console.log('   - NEXT_PUBLIC_MEASUREMENTS_VIDEO_URL (optional)');
    console.log('   - NEXT_PUBLIC_PHOTO_GUIDE_VIDEO_URL (optional)');
    console.log('4. Restart your application');
    console.log('5. Test the new features:\n');
    
    console.log('🆕 New Features Available:');
    console.log('   • Customer Profile Management');
    console.log('   • Body Measurements');
    console.log('   • Virtual Fitting Photo Mode');
    console.log('   • Size Recommendations');
    console.log('   • Shopify Integration');
    console.log('   • Video Help Modals\n');

    console.log('🔗 New Endpoints:');
    console.log('   • POST /api/customer/profile');
    console.log('   • GET  /api/customer/profile?email=...');
    console.log('   • POST /api/customer/measurements');
    console.log('   • GET  /api/customer/measurements?customerEmail=...');
    console.log('   • GET  /api/size-recommendations?customerEmail=...&productType=...');
    console.log('   • GET  /api/shopify/orders?customerEmail=...');
    console.log('   • GET  /customer/profile (Customer Profile Page)\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();