const mongoose = require('mongoose');

// Brands (company/brand) schema — scoped per franchise
const CompanyBrandsSchema = new mongoose.Schema(
	{
		franchiseId: { type: String, required: true },
		brandName: { type: String, required: true, trim: true, unique: true, }
	},
	{ timestamps: true }
);

// Ensure unique brandName per franchise
// CompanyBrandsSchema.index({ franchiseId: 1, brandName: 1 }, { unique: true });

const CompanyBrands = mongoose.model('CompanyBrands', CompanyBrandsSchema);
module.exports = CompanyBrands;

