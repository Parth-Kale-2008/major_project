const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";
async function main(){
    await mongoose.connect(MONGO_URL);
    console.log("connected to DB");
}

const initDB = async()=>{
    await main();
    // Sample listings need an owner that exists in this database.
    // This account has no password, so nobody can log in as it.
    let owner = await User.findOne({ username: "wanderlust" });
    if (!owner) {
        owner = await new User({ username: "wanderlust", email: "listings@wanderlust.example" }).save();
    }
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner:owner._id}));
    await Listing.insertMany(initData.data);
    console.log("data was initilized");
    await mongoose.connection.close();
};

initDB().catch((err)=>{
    console.log(err);
    process.exit(1);
});