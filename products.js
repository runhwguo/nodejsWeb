// store products as database:

let id = 0;

function nextId() {
    id++;
    return 'p' + id;
}

class Product {
    constructor(name, manufacturer, price) {
        this.id = nextId();
        this.name = name;
        this.manufacturer = manufacturer;
        this.price = price;
    }
}

let products = [
    new Product('iPhone 7', 'Apple', 6800),
    new Product('ThinkPad T440', 'Lenovo', 5999),
    new Product('LBP2900', 'Canon', 1099)
];

module.exports = {
    getProducts: () => products,

    getProduct: id => {
        for (let i = 0; i < products.length; i++) {
            if (products[i].id === id) {
                return products[i];
            }
        }
        return null;
    },

    createProduct: (name, manufacturer, price) => {
        let p = new Product(name, manufacturer, price);
        products.push(p);
        return p;
    },

    deleteProduct: id => {
        let index = -1;
        for (let i = 0; i < products.length; i++) {
            if (products[i].id === id) {
                index = i;
                break;
            }
        }
        if (index >= 0) {
            // remove products[index]:
            return products.splice(index, 1)[0];
        }
        return null;
    }
};
