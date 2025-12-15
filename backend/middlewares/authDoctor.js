import jwt from "jsonwebtoken";

// Doctor authentication middleware
const authDoctor = async(req,res,next) => {
    try {

        const {dtoken} = req.headers;

        if(!dtoken) {
            return res.json({success:false,message:"Not authorized, login again"})
        }

        const token_decode = jwt.verify(dtoken,process.env.JWT_SECRET);

        req.body = req.body || {};

        req.body.docId = token_decode.id;

        // we will get the id when we will decode the token and then we will give this id to request body on our own using backend

        next();
        
    } catch (error) {
        console.log(error);
        res.json({succes: false, message: `error is ${error.message}`})
    }
};

export default authDoctor;

// We have made the doctor middleware so that we could verify the doctor token and on the basis of it we get the doctor id and then in the controller we will get the specific doctor from doctor id