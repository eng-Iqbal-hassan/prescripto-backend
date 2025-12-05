import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";

// app config;

const app = express();
const port = process.env.PORT || 4000;
connectDB(); 
connectCloudinary();

// middleware
app.use(express.json());
app.use(cors());
 
// api end points

app.use('/api/admin',adminRouter)
// FRom here, whenever we will hit the endpoint localhost:4000/api/admin/add-doctor. From here it will go the admin routes and will chase the function which last parm is add-doctor. This function is addDoctor in adminController. In short on hit of this mentioned url, addDoctor function will be executed.

app.get("/", (req,res) => {
    res.send("API is working greatly")
});

// listen the app 

app.listen(port, ()=> console.log("Server started", port));