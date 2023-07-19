const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//List all dishes
function list(req, res) {
    res.json({ data: dishes })
}

//create new dish
function create(req, res) {
    const { data: { name, description, price, image_url} = {} } = req.body
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url
    }
    dishes.push(newDish)
    res.status(201).json({ data: newDish })
}

// read a dish specific to :dishId 
function read(req, res) {
    res.json({ data: res.locals.dish})
}

//updates a dish
function update(req, res) {
    const dish = res.locals.dish
    const { data: { name, description, price, image_url} = {} } = req.body

    dish.name = name
    dish.description = description
    dish.price = price
    dish.image_url = image_url

    res.json({ data: dish})
}

//reusabe function to check body data variables
function bodyDataHas(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body

        if (data[propertyName]) {
            return next()
        } else {
            next({
                status: 400,
                message: `Dish must include a ${propertyName}`
            })
        }
    }
}


// validate that price is an integer greater than 0
function validatePrice(req, res, next) {
    const { data: { price } = {} } = req.body
    if (Number.isInteger(price) && price > 0) {
        return next()
    } else {
        next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0"
        })
    }
}

// function to check if :dishId matches a dish 
function dishExists(req, res, next) {
    const { dishId } = req.params
    const foundDish = dishes.find((dish) => dish.id === dishId)

    if (foundDish) {
        res.locals.dish = foundDish
        return next()
    } else {
        return next({
            status: 404,
            message: `Dish does not exist ${dishId}`
        })
    }
}

// middleware to make sure id in body matches the id in the route
function idsMatch(req, res, next) {
    const { dishId } = req.params
    const { data: { id } = {} } = req.body

    if (id) {
        if(id !== dishId) {
            next({
                status: 400,
                message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
            })
        } else {
            next()
        }
    } else {
        next()
    }
}

module.exports = {
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        validatePrice,
        create
    ],

    update: [ 
        dishExists,
        idsMatch,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        validatePrice,
        update
    ],

    list,

    read: [
        dishExists,
        read
    ],

    
}