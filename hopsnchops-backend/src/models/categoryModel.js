const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema(
    {
        subCategoryName: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
        _id: true,
    }
);

const categorySchema = new mongoose.Schema(
    {
        franchiseId: { type: String, required: true },
        categoryName: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        subCategories: [subCategorySchema],
    },
    { timestamps: true }
);

const Categorys = mongoose.model('Categorys', categorySchema);
module.exports = Categorys
