const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

// Rutas para el manejo de productos
const productsRouter = express.Router();

// Ruta raíz GET /api/products/
productsRouter.get('/', (req, res) => {
  // Obtener todos los productos desde el archivo productos.json
  const productsData = fs.readFileSync('productos.json');
  const products = JSON.parse(productsData);

  // Limitar el número de productos si se proporciona el parámetro ?limit
  const limit = req.query.limit || products.length;
  const limitedProducts = products.slice(0, limit);

  res.json(limitedProducts);
});

// Ruta GET /api/products/:pid
productsRouter.get('/:pid', (req, res) => {
  const productId = parseInt(req.params.pid); // Convertir el ID a número

  // Obtener el producto con el ID proporcionado desde el archivo productos.json
  const productsData = fs.readFileSync('productos.json');
  const products = JSON.parse(productsData);

  const product = products.find((p) => p.id === productId);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Producto no encontrado' });
  }
});

// Ruta POST /api/products/
productsRouter.post('/', (req, res) => {
  const newProduct = req.body;

  // Leer los productos existentes desde el archivo productos.json
  const productsData = fs.readFileSync('productos.json');
  const products = JSON.parse(productsData);

  // Generar un nuevo ID para el producto
  const newId = generateProductId(products);

  // Agregar el nuevo producto al arreglo de productos
  newProduct.id = newId;
  products.push(newProduct);

  // Guardar los productos actualizados en el archivo productos.json
  fs.writeFileSync('productos.json', JSON.stringify(products));

  res.json(newProduct);
});

// Ruta PUT /api/products/:pid
productsRouter.put('/:pid', (req, res) => {
  const productId = parseInt(req.params.pid); // Convertir el ID a número
  const updatedProduct = req.body;

  // Leer los productos existentes desde el archivo productos.json
  const productsData = fs.readFileSync('productos.json');
  const products = JSON.parse(productsData);

  // Encontrar el producto con el ID proporcionado y actualizar sus campos
  const productIndex = products.findIndex((p) => p.id === productId);

  if (productIndex !== -1) {
    products[productIndex] = { ...products[productIndex], ...updatedProduct };

    // Guardar los productos actualizados en el archivo productos.json
    fs.writeFileSync('productos.json', JSON.stringify(products));

    res.json(products[productIndex]);
  } else {
    res.status(404).json({ message: 'Producto no encontrado' });
  }
});

// Ruta DELETE /api/products/:pid
productsRouter.delete('/:pid', (req, res) => {
  const productId = parseInt(req.params.pid); // Convertir el ID a número

  // Leer los productos existentes desde el archivo productos.json
  const productsData = fs.readFileSync('productos.json');
  const products = JSON.parse(productsData);

  // Filtrar los productos y eliminar el producto con el ID proporcionado
  const updatedProducts = products.filter((p) => p.id !== productId);

  if (updatedProducts.length !== products.length) {
    // Guardar los productos actualizados en el archivo productos.json
    fs.writeFileSync('productos.json', JSON.stringify(updatedProducts));

    res.json({ message: 'Producto eliminado exitosamente' });
  } else {
    res.status(404).json({ message: 'Producto no encontrado' });
  }
});

// Rutas para el manejo del carrito
const cartsRouter = express.Router();

// Ruta POST /api/carts/
cartsRouter.post('/', (req, res) => {
  const newCart = {
    id: generateCartId(),
    products: []
  };

  // Guardar el nuevo carrito en el archivo carrito.json
  fs.writeFileSync('carrito.json', JSON.stringify(newCart));

  res.json(newCart);
});

// Ruta GET /api/carts/:cid
cartsRouter.get('/:cid', (req, res) => {
  const cartId = req.params.cid;

  // Leer el carrito desde el archivo carrito.json
  const cartData = fs.readFileSync('carrito.json');
  const cart = JSON.parse(cartData);

  if (cart.id === cartId) {
    res.json(cart.products);
  } else {
    res.status(404).json({ message: 'Carrito no encontrado' });
  }
});

// Ruta POST /api/carts/:cid/product/:pid
cartsRouter.post('/:cid/product/:pid', (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;

  // Leer el carrito desde el archivo carrito.json
  const cartData = fs.readFileSync('carrito.json');
  const cart = JSON.parse(cartData);

  if (cart.id === cartId) {
    // Verificar si el producto ya existe en el carrito
    const existingProduct = cart.products.find((p) => p.product === productId);

    if (existingProduct) {
      // Incrementar la cantidad del producto existente
      existingProduct.quantity++;
    } else {
      // Agregar un nuevo producto al carrito
      cart.products.push({ product: productId, quantity: 1 });
    }

    // Guardar el carrito actualizado en el archivo carrito.json
    fs.writeFileSync('carrito.json', JSON.stringify(cart));

    res.json(cart.products);
  } else {
    res.status(404).json({ message: 'Carrito no encontrado' });
  }
});

// Registrar los routers de productos y carritos en sus respectivas rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Función para generar un nuevo ID para los productos
function generateProductId(products) {
  let newId = 1;

  if (products.length > 0) {
    const lastProduct = products[products.length - 1];
    newId = lastProduct.id + 1;
  }

  return newId;
}

// Función para generar un nuevo ID para los carritos
function generateCartId() {
  // Generar un ID aleatorio único (puedes usar una librería como uuid para esto)
  return Math.random().toString(36).substr(2, 9);
}

// Iniciar el servidor en el puerto
const port = 8080;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
