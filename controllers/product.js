import { asyncError } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/error.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary"
import { Category } from "../models/category.js"


export const getAllProducts = asyncError(async (req, res, next) => {
    // Search & Category query;

    // Macbook
    // trying search for "ook" 

    const { keyword, category } = req.query;
    const products = await Product.find({
        name: {
            $regex: keyword ? keyword : "",
            $options: "i",
        },
        category: category ? category : undefined,
    });

    res.status(200).json({
        success: true,
        products,
    })
})
export const getAdminProducts = asyncError(async (req, res, next) => {
    // Search & Category query;
    const products = await Product.find({}).populate("category");

    const outOfStock = products.filter((i) => i.stock === 0);


    res.status(200).json({
        success: true,
        products,
        outOfStock: outOfStock.length,
        inStock: products.length - outOfStock.length
    })
})
export const getProductDetails = asyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.productId).populate("category");

    if (!product) return next(new ErrorHandler("Product not found", 404))

    res.status(200).json({
        success: true,
        product,
    })
})
export const creatProduct = asyncError(async (req, res, next) => {
    const { name, description, category, stock, price } = req.body;

    if (!req.file) return next(new ErrorHandler("Please add image ", 400))

    const file = getDataUri(req.file)

    const myCloud = await cloudinary.v2.uploader.upload(file.content)
    const image = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url
    }
    await Product.create({
        name, description, category, stock, price, images: [image]
    })
    // console.log(myCloud.secure_url)


    res.status(200).json({
        success: true,
        message: "Product Created Successfully"
    })
})
export const updateProduct = asyncError(async (req, res, next) => {
    const { name, description, category, stock, price } = req.body;


    const product = await Product.findById(req.params.productId);
    if (!product) return next(new ErrorHandler("Product not found", 404))

    if (name) product.name = name
    if (description) product.description = description
    if (category) product.category = category
    if (stock) product.stock = stock
    if (price) product.price = price

    await product.save()

    res.status(200).json({
        success: true,
        message: "Product Updated Successfully"
    })
})

export const addProductImage = asyncError(async (req, res, next) => {

    const product = await Product.findById(req.params.productId);
    if (!product) return next(new ErrorHandler("Product not found", 404))

    if (!req.file) return next(new ErrorHandler("Please add image ", 400))

    const file = getDataUri(req.file)

    const myCloud = await cloudinary.v2.uploader.upload(file.content)
    const image = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url
    }
    product.images.push(image)
    await product.save()


    res.status(200).json({
        success: true,
        message: "Image Added Successfully"
    })
})
export const DeleteProductImage = asyncError(async (req, res, next) => {

    const product = await Product.findById(req.params.productId);
    if (!product) return next(new ErrorHandler("Product not found", 404))

    const id = req.query.id;
    if (!id) return next(new ErrorHandler("Please Enter Image Id", 400))

    let isExist = -1;
    product.images.forEach((item, index) => {
        if (item._id.toString() === id.toString()) isExist = index;
    })
    if (isExist < 0) return next(new ErrorHandler("Image doesn't exist", 400))
    await cloudinary.v2.uploader.destroy(product.images[isExist].public_id)
    product.images.splice(isExist, 1)
    await product.save()

    res.status(200).json({
        success: true,
        message: "Image deleted Successfully"
    })
})
export const deleteProduct = asyncError(async (req, res, next) => {

    const product = await Product.findById(req.params.productId);
    if (!product) return next(new ErrorHandler("Product not found", 404))

    for (let index = 0; index < product.images.length; index++) {
        await cloudinary.v2.uploader.destroy(product.images[index].public_id)
    }
    await product.remove();

    res.status(200).json({
        success: true,
        message: "Product deleted Successfully"
    })
})


export const addCategory = asyncError(async (req, res, next) => {
    await Category.create(req.body)
    res.status(201).json({
        success: true,
        message: "Category Added Successfuly "
    })
})
export const getAllCategories = asyncError(async (req, res, next) => {
    const categories = await Category.find({});
    res.status(200).json({
        success: true,
        categories,
    })
})
export const deleteCategory = asyncError(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ErrorHandler("Category Not Found", 404));
    const products = await Product.find({ category: category._id })

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        product.category = undefined;
        await product.save();
        await category.remove()
    }

    res.status(200).json({
        success: true,
        message: "Category Deleted Successfully"
    })

})