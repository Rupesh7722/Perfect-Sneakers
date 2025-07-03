const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const Shoe = require("./models/shoe.js");
const mongoose = require("mongoose");

const baseUrl = process.env.BASE_URL || "http://localhost:8080";

main()
    .then(() => console.log("connection successful"))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/sneakers');
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
    res.render("home.ejs", { baseUrl });
});

app.get("/all", async (req, res) => {
    const allshoes = await Shoe.find();

    let id = [], name = [], brand = [], color = [], image_link = [], product_link = [], price = [], sizes = [];

    for (let shoes of allshoes) {
        id.push(shoes._id);
        name.push(shoes.Name);
        brand.push(shoes.Brand);
        color.push(shoes.Color);
        image_link.push(shoes.image_link);
        product_link.push(shoes.product_link);
        price.push(shoes.Price);
        sizes.push(shoes.Sizes);
    }

    const shoesWithLeastPrice = await Shoe.aggregate([
        { $match: { Price: { $not: { $regex: /not available/i } } } },
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
                                                    input: "$Price",
                                                    find: "₹",
                                                    replacement: ""
                                                }
                                            },
                                            find: ",",
                                            replacement: ""
                                        }
                                    },
                                    find: " ",
                                    replacement: ""
                                }
                            }
                        }
                    }
                }
            }
        },
        { $sort: { priceAsNumber: 1 } },
        {
            $group: {
                _id: "$Name",
                shoe: { $first: "$$ROOT" }
            }
        },
        { $project: { priceAsNumber: 0 } }
    ]);

    let id1 = [], name1 = [], brand1 = [], color1 = [], image_link1 = [], product_link1 = [], price1 = [], sizes1 = [];

    for (let shoe of shoesWithLeastPrice) {
        id1.push(shoe.shoe._id);
        name1.push(shoe.shoe.Name);
        brand1.push(shoe.shoe.Brand);
        color1.push(shoe.shoe.Color);
        image_link1.push(shoe.shoe.image_link);
        product_link1.push(shoe.shoe.product_link);
        price1.push(shoe.shoe.Price);
        sizes1.push(shoe.shoe.Sizes);
    }

    res.render("all.ejs", { id, name, brand, color, image_link, product_link, price, sizes, id1, name1, brand1, color1, image_link1, product_link1, price1, sizes1, baseUrl });
});

app.get("/all/:name", async (req, res) => {
    const { name } = req.params;
    const allshoes = await Shoe.find({ Name: name });

    let id = [], name1 = [], brand = [], color = [], image_link = [], product_link = [], price = [], sizes = [];

    for (let shoes of allshoes) {
        id.push(shoes._id);
        name1.push(shoes.Name);
        brand.push(shoes.Brand);
        color.push(shoes.Color);
        image_link.push(shoes.image_link);
        product_link.push(shoes.product_link);
        price.push(shoes.Price);
        sizes.push(shoes.Sizes);
    }

    res.render("all1.ejs", { name1, id, name, brand, color, image_link, product_link, price, sizes });
});
