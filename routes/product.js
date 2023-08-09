import express from "express";

import { Admin, isAuthenticated } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";
import { deleteProduct, DeleteProductImage, addProductImage, creatProduct, getAllProducts, getProductDetails, updateProduct, addCategory, getAllCategories, deleteCategory, getAdminProducts } from "../controllers/product.js";

const router = express.Router()



router.get("/all", getAllProducts)
router.get("/admin", isAuthenticated, Admin, getAdminProducts,)
router.route("/single/:productId").get(getProductDetails).put(isAuthenticated, Admin, updateProduct).delete(isAuthenticated, Admin, deleteProduct)
router.post("/new", isAuthenticated, Admin, singleUpload, creatProduct)

router.route("/images/:productId").post(isAuthenticated, Admin, singleUpload, addProductImage).delete(isAuthenticated, Admin, DeleteProductImage)

router.post("/category", isAuthenticated, Admin, addCategory)
router.get("/categories", getAllCategories)
router.delete("/category/:id", isAuthenticated, Admin, deleteCategory)
export default router;

