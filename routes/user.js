import express from "express";
import { changePassword, forgetpassword, getMyProfile, logOut, login, resetpassword, signUp, updatePic, updateProfile } from "../controllers/user.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router()
router.post("/Login", login)
router.post("/new", singleUpload, signUp)
router.post("/me", isAuthenticated, getMyProfile)
router.post("/logout", isAuthenticated, logOut)

// Updating Routes

router.put("/updateprofile", isAuthenticated, updateProfile)
router.put("/changePassword", isAuthenticated, changePassword)
router.put("/updatepic", isAuthenticated, singleUpload, updatePic)

// Forgetting the Password
router.route("/forgetpassword").post(forgetpassword).put(resetpassword)

export default router;

