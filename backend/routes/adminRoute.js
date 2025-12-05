import express from "express";
import { addDoctor, loginAdmin } from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";

// After importing our required things, we will create routes. For that, first we will create router 

const adminRouter = express.Router();

adminRouter.post("/add-doctor", upload.single('image'),addDoctor);
adminRouter.post("/login",loginAdmin);
 
export default adminRouter;