const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");

const deleteProductImageIfExists = (imagePathOrUrl) => {
    if (!imagePathOrUrl) return;

    const uploadsPrefix = "/uploads/products/";
    if (!imagePathOrUrl.includes(uploadsPrefix)) return;

    const fileName = path.basename(imagePathOrUrl);
    const fullPath = path.join(__dirname, "../uploads/products", fileName);

    if (fs.existsSync(fullPath)) {
        try {
            fs.unlinkSync(fullPath);
        } catch (e) {
            console.error("Failed to delete product image:", e);
        }
    }
};

const normalizeProductData = (body = {}) => {
    const normalized = { ...body };

    if (!normalized.name && normalized.title) {
        normalized.name = normalized.title;
    }

    if (!normalized.description && normalized.desc) {
        normalized.description = normalized.desc;
    }

    if (!normalized.image && normalized.img) {
        normalized.image = normalized.img;
    }

    return normalized;
};

// Add Product
const addProduct = async (req, res) => {
    try {
        const productData = normalizeProductData(req.body);
        const product = await Product.create(productData);
        res.status(201).json(product);
    } catch (error) {
    console.error("Create Product Error:", error);


    res.status(500).json({
        message: error.message
    });
}
};

// Get All Products
const getProducts = async (req, res) => {
    try {
        const { keyword, category } = req.query;

        let filter = {};

        if (keyword) {
            filter.name = { $regex: keyword, $options: "i" };
        }

        if (category) {
            filter.category = category;
        }

        const products = await Product.find(filter).select("image name category price stock");

        res.json(products);

    } catch (error) {
    console.error("Create Product Error:", error);

    res.status(500).json({
        message: error.message
    });
}
};

// Get Single Product
const getProductById = async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(product);

    } catch (error) {
    console.error("Create Product Error:", error);

    res.status(500).json({
        message: error.message
    });
}

};

// Update Product
const updateProduct = async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const productData = normalizeProductData(req.body);

        Object.assign(product, productData);

        const updated = await product.save();

        res.json(updated);

    } catch (error) {
    console.error("Create Product Error:", error);

    res.status(500).json({
        message: error.message
    });
}

};

// Delete Product
const deleteProduct = async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Delete image file first
        deleteProductImageIfExists(product.image);


        await product.deleteOne();

        res.json({
            message: "Product deleted successfully"
        });

    } catch (error) {
    console.error("Create Product Error:", error);

    res.status(500).json({
        message: error.message
    });
}

};

const addReview = async (req, res) => {

    try {

        const { rating, comment } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });

        }

        const alreadyReviewed = product.reviews.find(

            review => review.user.toString() === req.user._id.toString()

        );

        if (alreadyReviewed) {

            return res.status(400).json({
                message: "You already reviewed this product"
            });

        }

        const review = {

            user: req.user._id,

            name: req.user.name,

            rating: Number(rating),

            comment

        };

        product.reviews.push(review);

        product.numReviews = product.reviews.length;

        product.rating =

            product.reviews.reduce(

                (acc, item) => acc + item.rating,

                0

            ) / product.reviews.length;

        await product.save();

        res.status(201).json({
            message: "Review Added Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {

    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addReview

};