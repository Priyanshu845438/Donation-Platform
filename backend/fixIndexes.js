const mongoose = require('mongoose');

async function fixDatabaseIndexes() {
  try {
    // Use IPv4 loopback to avoid ::1 (IPv6) connection issues
    const mongoUri = 'mongodb://127.0.0.1:27017/donation';
    console.log('🔌 Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // List current indexes
    console.log('📋 Current indexes on NGO collection:');
    const indexes = await db.collection('ngos').indexes();
    indexes.forEach(idx => console.log(' -', idx.name, ':', JSON.stringify(idx.key)));

    // Drop problematic indexes (if exist)
    const problematicIndexes = [
      'authorizedPerson.email_1',
      'tanNumber_1',
      'panNumber_1',
      'gstNumber_1',
      'bankDetails.accountNumber_1'
    ];

    console.log('🗑️ Dropping problematic indexes...');
    for (const indexName of problematicIndexes) {
      try {
        await db.collection('ngos').dropIndex(indexName);
        console.log('✅ Dropped:', indexName);
      } catch (err) {
        console.log('ℹ️ Index not found or already dropped:', indexName);
      }
    }

    // Update existing NGO documents with default values
    console.log('🔄 Updating existing NGO documents...');
    const updateResult = await db.collection('ngos').updateMany(
      {},
      {
        $set: {
          'authorizedPerson.name': 'Not provided',
          'authorizedPerson.phone': 'Not provided',
          'panNumber': '',
          'tanNumber': '',
          'gstNumber': '',
          'bankDetails.accountHolderName': 'Not provided',
          'bankDetails.accountNumber': '',
          'bankDetails.ifscCode': 'Not provided',
          'bankDetails.bankName': 'Not provided',
          'bankDetails.branchName': 'Not provided'
        }
      }
    );
    console.log(`✅ Updated ${updateResult.modifiedCount} NGO documents`);

    // Copy main email to authorizedPerson.email if missing
    await db.collection('ngos').updateMany(
      { 'authorizedPerson.email': { $exists: false } },
      [
        {
          $set: {
            'authorizedPerson.email': '$email'
          }
        }
      ]
    );
    console.log('✅ Set authorizedPerson.email to main email where missing');

    // Show final indexes
    console.log('📋 Final indexes:');
    const finalIndexes = await db.collection('ngos').indexes();
    finalIndexes.forEach(idx => console.log(' -', idx.name, ':', JSON.stringify(idx.key)));

    console.log('🎉 Database cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixDatabaseIndexes();
