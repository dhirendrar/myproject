const express = require('express');
const path = require('path');
const Product = require('./src/main/resources/product');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('src/main/resources'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/main/resources/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

app.post('/api/process', (req, res) => {
    try {
        const product = new Product(
            {
                id: req.body.id,
                name: req.body.name,
                price: req.body.price,
                tags: req.body.tags,
                details: req.body["product details"]
            });
        const result = product.processUpdate();
        res.json(result);
    } catch (ex) {
        res.status(400).json({
                error: ex.message
            });
    }
});