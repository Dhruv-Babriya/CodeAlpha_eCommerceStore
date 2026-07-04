const Product = require("../models/Product");

// Add Product
const addProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        res.status(500).json({ message: error.message });
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

        Object.assign(product, req.body);

        const updated = await product.save();

        res.json(updated);

    } catch (error) {

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