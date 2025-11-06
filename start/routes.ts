import router from '@adonisjs/core/services/router'

const AuthController = () => import('#controllers/auth_controller')
const UsersController = () => import('#controllers/users_controller')
const ProductsController = () => import('#controllers/products_controller')
const ImagesController = () => import('#controllers/images_controller')
const HomeController = () => import('#controllers/home_controller')

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
router.get('/profile', [UsersController, 'edit']).as('user.profile.edit')
router.post('/profile', [UsersController, 'update']).as('user.profile.update')

/*
|--------------------------------------------------------------------------
| Produtos
|--------------------------------------------------------------------------
*/
router.resource('/products', ProductsController).as('products')

/*
|--------------------------------------------------------------------------
| Imagens
|--------------------------------------------------------------------------
*/
router.get('/images/:name', [ImagesController, 'show']).as('images.show')



