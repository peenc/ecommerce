import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'


const AuthController = () => import('#controllers/auth_controller')
const UsersController = () => import('#controllers/users_controller')
const ProductsController = () => import('#controllers/products_controller')
const ImagesController = () => import('#controllers/images_controller')
const HomeController = () => import('#controllers/home_controller')
const CartController = () => import('#controllers/cart_controller')

/*
|--------------------------------------------------------------------------
| Página inicial
|--------------------------------------------------------------------------
*/
router.get('/', [HomeController, 'index']).as('home')

/*
|--------------------------------------------------------------------------
| Autenticação
|--------------------------------------------------------------------------
*/
router.get('/register', [AuthController, 'showRegister']).as('auth.register.show')
router.post('/register', [AuthController, 'register']).as('auth.register')

router.get('/login', [AuthController, 'showLogin']).as('auth.login.show')
router.post('/login', [AuthController, 'login']).as('auth.login')

router.post('/logout', [AuthController, 'logout']).as('auth.logout')

/*
|--------------------------------------------------------------------------
| Perfil do usuário
|--------------------------------------------------------------------------
*/
router
  .get('/profile', [UsersController, 'edit'])
  .use(middleware.auth())
  .as('user.profile.edit')

router
  .post('/profile', [UsersController, 'update'])
  .use(middleware.auth())
  .as('user.profile.update')

/*
|--------------------------------------------------------------------------
| Produtos
|--------------------------------------------------------------------------
*/

router
  .group(() => {
    router.get('/products/create', [ProductsController, 'create']).as('products.create')
    router.post('/products', [ProductsController, 'store']).as('products.store')
    router.get('/products/:id/edit', [ProductsController, 'edit']).as('products.edit')
    router.put('/products/:id', [ProductsController, 'update']).as('products.update')
    router.delete('/products/:id', [ProductsController, 'destroy']).as('products.destroy')
    router.get('/products', [ProductsController, 'index']).as('products.index')
  
    // controle de estoque
    router.post('/products/:id/stock', [ProductsController, 'updateStock']).as('products.updateStock')
    router.post('/products/:id/addstock', [ProductsController, 'addStock']).as('products.addStock')
    router.post('/products/:id/removestock', [ProductsController, 'removeStock']).as('products.removeStock')

  })
  .use([middleware.auth(), middleware.admin()])


router.get('/products/:id', [ProductsController, 'show']).as('products.show')
/*
|--------------------------------------------------------------------------
| Imagens
|--------------------------------------------------------------------------
*/
router.get('/images/:name', [ImagesController, 'show']).as('images.show')


/*
|--------------------------------------------------------------------------
| Carrinho
|--------------------------------------------------------------------------
*/
router
  .get('/cart', [CartController, 'show'])
  .use(middleware.auth())
  .as('cart.show')

router
  .post('/cart/add', [CartController, 'add'])
  .use(middleware.auth())
  .as('cart.add')

router
  .post('/cart/remove/:productId', [CartController, 'remove'])
  .use(middleware.auth())
  .as('cart.remove')

router.post('/cart/increase/:productId', [CartController, 'increase'])
.use(middleware.auth())
.as('cart.increase')

router.post('/cart/decrease/:productId', [CartController, 'decrease'])
.use(middleware.auth())
.as('cart.decrease')
