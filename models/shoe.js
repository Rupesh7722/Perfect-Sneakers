const mongoose=require("mongoose");

const shoeSchema = new mongoose.Schema({
    Name: String,
    Brand: String,
    Color: String,
    image_link: String,
    product_link: String,
    Price: String,
    Sizes: [String]
});

const Shoe = mongoose.model("Shoe", shoeSchema);
module.exports=Shoe;
