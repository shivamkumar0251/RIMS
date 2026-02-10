const mongoose = require('mongoose');
const { MONGODB_URL } = require('../config/env');
const Products = require('../models/productsModel');

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("Connection Error", err);
        process.exit(1);
    }
};

const clearDuplicates = async () => {
    await connectDB();

    console.log("Finding duplicates...");

    // Aggregate to find duplicate products based on name and productType
    const duplicates = await Products.aggregate([
        {
            $group: {
                _id: { productName: "$productName", productType: "$productType", franchiseId: "$franchiseId" },
                uniqueIds: { $addToSet: "$_id" },
                count: { $sum: 1 }
            }
        },
        {
            $match: {
                count: { $gt: 1 }
            }
        }
    ]);

    console.log(`Found ${duplicates.length} duplicate groups.`);

    let validDeletionCount = 0;

    for (const group of duplicates) {
        // Sort IDs to keep the oldest (original) one and delete others
        // Or keep the newest? Usually keeping the oldest is safer ID-wise, but newest might have updated data.
        // Let's keep the NEWEST one (presuming it's the latest edit/entry)

        // Sorting IDs (timestamps embedded in ObjectId)
        const ids = group.uniqueIds.map(id => id.toString()).sort();

        // Keep the last one (newest), delete the rest
        const idToKeep = ids.pop();
        const idsToDelete = ids;

        if (idsToDelete.length > 0) {
            await Products.deleteMany({ _id: { $in: idsToDelete } });
            console.log(`Deleted ${idsToDelete.length} duplicates for product: ${group._id.productName}`);
            validDeletionCount += idsToDelete.length;
        }
    }

    console.log(`Total duplicates removed: ${validDeletionCount}`);
    process.exit();
};

clearDuplicates();
