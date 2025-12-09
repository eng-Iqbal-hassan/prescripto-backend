import jwt from "jsonwebtoken";

// admin authentication middleware
const authUser = async(req,res,next) => {
    try {

        const {token} = req.headers;

        if(!token) {
            return res.json({success:false,message:"Not authorized, login again"})
        }

        const token_decode = jwt.verify(token,process.env.JWT_SECRET);

        // after decoding the token we will get an object

        req.body = req.body || {};

        req.body.userId = token_decode.id;

        // we will get the id when we will decode the token and then we will give this id to request body on our own using backend

        next();
        
    } catch (error) {
        console.log(error);
        res.json({succes: false, message: `error is ${error.message}`})
    }
};

export default authUser;