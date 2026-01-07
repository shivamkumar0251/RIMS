
const Categorys = require("../models/categoryModel");
const fs = require('fs');
let xlsx;
try { xlsx = require('xlsx'); } catch (e) { xlsx = null; }


exports.getCategoriesByFranchise = async (req, res) => {
  try {
    const franchiseId = req.user?.franchiseId;

    if (!franchiseId) {
      return res.status(400).json({
        success: false,
        message: "Franchise ID missing from user data",
      });
    }

    const {
      search = "",
      page = 1,
      limit = 50,
      fromDate,
      toDate,
    } = req.query;

    const pageNumber = Number(page);
    const pageLimit = Number(limit);
    const skip = (pageNumber - 1) * pageLimit;

    let query = { franchiseId };

    if (search) {
      query.$or = [
        { categoryName: { $regex: search, $options: "i" } },
        { "subCategories.subCategoryName": { $regex: search, $options: "i" } }
      ];
    }

    if (fromDate || toDate) {
      query.createdAt = {};

      if (fromDate) query.createdAt.$gte = new Date(fromDate);

      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999); 
        query.createdAt.$lte = end;
      }
    }

    const total = await Categorys.countDocuments(query);

    const categories = await Categorys.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    return res.status(200).json({
      success: true,
      total,
      currentPage: pageNumber,
      limit:pageLimit,
      totalPages: Math.ceil(total / pageLimit),
      count: categories.length,
      data: categories,
    });

  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
    });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const franchiseId = req.user?.franchiseId;
    const { categoryName } = req.body;

     if (!franchiseId) {
      return res.status(400).json({
        success: false,
        message: "Franchise ID missing from user data",
      });
    }
    if (!categoryName) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existingCategory = await Categorys.findOne({
      categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") }, // case-insensitive
      franchiseId,
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists in this franchise",
      });
    }

    // ✅ Create new category for this franchise
    const newCategory = await Categorys.create({
      categoryName,
      franchiseId,
    });

    return res.status(201).json({
      success: true,
      message: "Category added successfully",
      data: newCategory,
    });

  } catch (error) {
    console.error("Error adding category:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding category",
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const franchiseId = req.user?.franchiseId;
    const { categoryId } = req.params;
    const { categoryName } = req.body;

    if (!franchiseId) {
      return res.status(400).json({
        success: false,
        message: "Franchise ID missing from user data",
      });
    }

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // ✅ Update only if categoryName  belongs to the same franchise
    const updatedCategory = await Categorys.findOneAndUpdate(
      { _id: categoryId, franchiseId },
      { categoryName },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found or unauthorized to update",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });

  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating category",
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const franchiseId = req.user?.franchiseId;
    const { categoryId } = req.params;

    if (!franchiseId) {
      return res.status(400).json({
        success: false,
        message: "Franchise ID missing from user data",
      });
    }

    // ✅ Delete only if category belongs to this franchise
    const deletedCategory = await Categorys.findOneAndDelete({
      _id: categoryId,
      franchiseId,
    });

    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found or unauthorized to delete",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: deletedCategory,
    });

  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting category",
    });
  }
};

// ✅ Add Sub-Category in a Category
exports.addSubCategory = async (req, res) => {
  try {
    const franchiseId = req.user?.franchiseId;
    const { categoryId } = req.params;
    const { subCategoryName } = req.body;

    if (!franchiseId) {
      return res.status(400).json({
        success: false,
        message: "Franchise ID missing from user data",
      });
    }

    // Find category under same franchise
    const category = await Categorys.findOne({ _id: categoryId, franchiseId });
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found for this franchise" });
    }

    if (!subCategoryName || !subCategoryName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Sub-category name is required",
      });
    }

    //  Check if sub-category already exists (case-insensitive)
    const isDuplicate = category.subCategories.some(
      (sub) => sub.subCategoryName.toLowerCase() === subCategoryName.trim().toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        message: "Sub-category name already exists in this category",
      });
    }

    // Push new sub-category to array
    category.subCategories.push({ subCategoryName });
    await category.save();

    res.status(201).json({
      success: true,
      message: "Sub-category added successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update a Sub-Category
exports.updateSubCategory = async (req, res) => {
  try {
    const franchiseId = req.user?.franchiseId;
    const { categoryId, subCategoryId } = req.params;
    const { subCategoryName } = req.body;

    if (!franchiseId) {
      return res.status(400).json({
        success: false,
        message: "Franchise ID missing from user data",
      });
    }

    // Find category under same franchise
    const category = await Categorys.findOne({ _id: categoryId, franchiseId });
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found for this franchise" });
    }

    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({ message: "Sub-category not found" });
    }

    subCategory.subCategoryName = subCategoryName;
    subCategory.updatedAt = Date.now();

    await category.save();

    res.json({
      success: true,
      message: "Sub-category updated successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete a Sub-Category
exports.deleteSubCategory = async (req, res) => {
  try {
    const franchiseId = req.user?.franchiseId;
    const { categoryId, subCategoryId } = req.params;

    if (!franchiseId) {
      return res.status(400).json({
        success: false,
        message: "Franchise ID missing from user data",
      });
    }

    // Find category under same franchise
    const category = await Categorys.findOne({ _id: categoryId, franchiseId });
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found for this franchise" });
    }

    const initialCount = category.subCategories.length;
    category.subCategories = category.subCategories.filter(
      (sub) => sub._id.toString() !== subCategoryId
    );

    if (category.subCategories.length === initialCount) {
      return res.status(404).json({ message: "Sub-category not found" });
    }

    await category.save();

    res.json({
      success: true,
      message: "Sub-category deleted successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk create/update categories and sub-categories from Excel
exports.bulkCreateFromExcel = async (req, res) => {
  try {
    const franchiseId = req.user?.franchiseId;
    if (!franchiseId) {
      return res.status(400).json({ success: false, message: "Franchise ID missing" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "Excel file is required" });
    }

    // Read excel
    const workbook = file.buffer
      ? xlsx.read(file.buffer, { type: "buffer" })
      : xlsx.readFile(file.path);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    if (!rows.length) {
      return res.status(400).json({ success: false, message: "Excel is empty" });
    }

    /* ================= NORMALIZE DATA ================= */
    const categoryMap = {};

    for (const r of rows) {
      const catName = String(r.categoryName || "").trim();
      const subName = String(r.subCategories || "").trim();

      if (!catName) continue;

      const key = catName.toLowerCase();

      if (!categoryMap[key]) {
        categoryMap[key] = {
          categoryName: catName,
          subCategories: new Set(),
        };
      }

      if (subName) {
        categoryMap[key].subCategories.add(subName);
      }
    }

    /* ================= DB OPERATIONS ================= */
    const results = {
      created: 0,
      updated: 0,
      addedSubCategories: 0,
      skipped: 0,
    };

    for (const key of Object.keys(categoryMap)) {
      const { categoryName, subCategories } = categoryMap[key];

      let category = await Categorys.findOne({
        franchiseId,
        categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
      });

      // CREATE
      if (!category) {
        const subArr = Array.from(subCategories).map((s) => ({
          subCategoryName: s,
        }));

        await Categorys.create({
          franchiseId,
          categoryName,
          subCategories: subArr,
        });

        results.created++;
        results.addedSubCategories += subArr.length;
        continue;
      }

      // UPDATE (add missing subcategories)
      let added = 0;
      for (const s of subCategories) {
        const exists = category.subCategories.some(
          (sc) => sc.subCategoryName.toLowerCase() === s.toLowerCase()
        );

        if (!exists) {
          category.subCategories.push({ subCategoryName: s });
          added++;
        }
      }

      if (added > 0) {
        await category.save();
        results.updated++;
        results.addedSubCategories += added;
      } else {
        results.skipped++;
      }
    }

    // cleanup file
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return res.status(200).json({
      success: true,
      message: "Bulk category import completed",
      results,
    });
  } catch (err) {
    console.error("bulkCreateFromExcel error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};