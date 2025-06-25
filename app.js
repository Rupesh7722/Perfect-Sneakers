const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const Shoe = require("./models/shoe.js")

const mongoose = require("mongoose");
main()
    .then(res => console.log("connection successful"))
    .catch(err => console.log(err));
async function main() {
    try {
        console.log("Attempting to connect to MongoDB...");
        await mongoose.connect('mongodb://127.0.0.1:27017/sneakers');
        console.log("Connection successful!");

        // List all collections in the 'sneakers' database
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections in the 'sneakers' database:", collections.map(col => col.name));

        // Optionally, print out a few records to confirm the data
        const allShoes = await Shoe.find().limit(2); // Limit to 5 records for testing
        console.log("Sample Data:", allShoes);

    } catch (err) {
        console.error("Error connecting to the database:", err);
    }
}


app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

app.get("/", (req, res) => {
    res.render("home.ejs");
});


app.get("/all", async (req, res) => {
    const allshoes = await Shoe.find();

    let id = [];
    let name = [];
    let brand = [];
    let color = [];
    let image_link = [];
    let product_link = [];
    let price = [];
    let sizes = [];

    try {
        for (shoes of allshoes) {
            let id1 = shoes._id;
            let name1 = shoes.Name;
            let brand1 = shoes.Brand;
            let color1 = shoes.Color;
            let image_link1 = shoes.image_link;
            let product_link1 = shoes.product_link;
            let price1 = shoes.Price;
            let sizes1 = shoes.Sizes;


            id.push(id1);
            name.push(name1);
            brand.push(brand1);
            color.push(color1);
            image_link.push(image_link1);
            product_link.push(product_link1);
            price.push(price1);
            sizes.push(sizes1);
        }
    } catch (err) {
        res.send("Error in fetching data");
        console.log(err);
    };

    const groupedShoes = await Shoe.aggregate([
        {
            $group: {
                _id: "$Name", // Group by the "Name" field
                shoes: { $push: "$$ROOT" } // Collect all details of shoes with the same name
            }
        }
    ]);

    // console.log(groupedShoes);
    let id1 = [];
    let name1 = [];
    let brand1 = [];
    let color1 = [];
    let image_link1 = [];
    let product_link1 = [];
    let price1 = [];
    let sizes1 = [];

    const shoesWithLeastPrice = await Shoe.aggregate([
        {
            $match: {
                Price: {
                    $not: { $regex: /not available/i } // Exclude prices with "not available" (case insensitive)
                }
            }
        },
        {
            $addFields: {
                priceAsString: { $toString: "$Price" } // Convert Price to a string
            }
        },
        {
        $addFields: {
            priceAsNumber: {
                $toInt: {
                    $trim: {
                        input: {
                            $replaceAll: {
                                input: {
                                    $replaceAll: {
                                        input: {
                                            $replaceAll: {
                                                input: "$Price", // Original Price string
                                                find: "₹", // Remove rupee symbol
                                                replacement: ""
                                            }
                                        },
                                        find: ",", // Remove commas
                                        replacement: ""
                                    }
                                },
                                find: " ", // Remove spaces
                                replacement: ""
                            }
                        }
                    }
                },
            }
        }
        },
    {
        $sort: { priceAsNumber: 1 } // Sort by numeric price
    },
    {
        $group: {
            _id: "$Name", // Group by the "Name" field
            shoe: { $first: "$$ROOT" } // Select the first document (lowest price after sorting)
        }
    },
    {
        $project: {
            priceAsNumber: 0 // Remove the temporary numeric field from the output
        }
    }
    ]);




for (shoe of shoesWithLeastPrice) {
    id1.push(shoe.shoe._id);
    name1.push(shoe.shoe.Name);
    brand1.push(shoe.shoe.Brand);
    color1.push(shoe.shoe.Color);
    price1.push(shoe.shoe.Price);
    sizes1.push(shoe.shoe.Sizes);
    image_link1.push(shoe.shoe.image_link);
    product_link1.push(shoe.shoe.product_link);
}





res.render("all.ejs", { id, name, brand, color, image_link, product_link, price, sizes, id1, name1, brand1, color1, image_link1, product_link1, price1, sizes1 }); 
    
});

app.get("/all/:name", async (req, res) => {
    let { name } = req.params;
    const allshoes = await Shoe.find({ Name: name });

    let id = [];
    let name1 = [];
    let brand = [];
    let color = [];
    let image_link = [];
    let product_link = [];
    let price = [];
    let sizes = [];

    try {
        for (shoes of allshoes) {

            id.push(shoes._id);
            name1.push(shoes.Name);
            brand.push(shoes.Brand);
            color.push(shoes.Color);
            image_link.push(shoes.image_link);
            product_link.push(shoes.product_link);
            price.push(shoes.Price);
            sizes.push(shoes.Sizes);
        }
    } catch (err) {
        res.send("Error in fetching data");
        console.log(err);
    };

    res.render("all1.ejs", { name1, id, name, brand, color, image_link, product_link, price, sizes });
})