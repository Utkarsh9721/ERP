import mongoose from "mongoose";

const mongooseConnection=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("mongoose is connected");
    }catch(err){
        console.error("mongoose connection Error",err.message);
        process.exit(1);
    }
};
export default mongooseConnection;