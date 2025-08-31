// Script to clone test_database to animal_hospital_db

// Connect to source database
db = db.getSiblingDB('test_database');

// Get all collection names
const collections = db.getCollectionNames();

console.log('Found collections in test_database:', collections);

// Switch to target database
const targetDb = db.getSiblingDB('animal_hospital_db');

// Clone each collection
collections.forEach(function(collectionName) {
    console.log('Cloning collection:', collectionName);
    
    // Get all documents from source
    const sourceCollection = db.getCollection(collectionName);
    const documents = sourceCollection.find().toArray();
    
    if (documents.length > 0) {
        // Insert into target database
        const targetCollection = targetDb.getCollection(collectionName);
        targetCollection.insertMany(documents);
        console.log('Copied', documents.length, 'documents to', collectionName);
    } else {
        console.log('No documents found in', collectionName);
    }
});

console.log('Database cloning completed successfully!');