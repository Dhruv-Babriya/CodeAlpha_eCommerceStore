const Product = require("../models/Product");

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

        const products = await Product.find(filter);

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

module.exports = {
    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};