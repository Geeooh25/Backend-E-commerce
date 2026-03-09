const mongoose = require('mongoose');
const uri = 'mongodb+srv://beedahttreats_db_user:n7okU8Bs9rhA9bF3@beedaht.x0grs6q.mongodb.net/beedaht_db?retryWrites=true&w=majority&appName=beedaht';

console.log('🔌 Testing MongoDB connection...');
console.log('URI:', uri.replace(/n7okU8Bs9rhA9bF3/g, '********'));

mongoose.connect(uri)
  .then(() => {
    console.log('✅ SUCCESS! Connected to MongoDB!');
    console.log('Database:', mongoose.connection.name);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ FAILED!');
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    process.exit(1);
  });