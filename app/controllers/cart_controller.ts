import Cart from '#models/cart'
import CartItem from '#models/cart_item'
import Product from '#models/product'
import type { HttpContext } from '@adonisjs/core/http'

export default class CartController {
 async show({ auth, response, view }: HttpContext) {
  const user = auth.user

  if (!user) {
    return response.redirect('/login')
  }

  // Buscar o carrinho do usuário
  let cart = await Cart
    .query()
    .where('user_id', user.id)
    .preload('items', q => 
      q.preload('product', p => p.preload('images'))
    )
    .first()


  // Se não existir, cria
  if (!cart) {
    cart = await Cart.create({ userId: user.id })
  }

  return view.render('pages/cart/showcart', { cart })
}


  async add({ auth, request, response }: HttpContext) {
  const user = auth.user!
  // garante que o carrinho exista
  let cart = await Cart.findBy('user_id', user.id)
  if (!cart) {
    cart = await Cart.create({ userId: user.id })
  }

  const productId = request.input('productId')
  const product = await Product.findOrFail(productId)

  // busca item existente usando nomes de coluna reais do DB
  let item = await CartItem
    .query()
    .where('cart_id', cart.id)       // note 'cart_id' em snake_case
    .where('product_id', product.id) // note 'product_id'
    .first()

  if (item) {
    // se existir, incrementa quantidade
    item.quantity = item.quantity + 1
    item.total = Number((item.quantity * Number(item.price)).toFixed(2))
    await item.save()
  } else {
    // se não existir, cria novo
    item = await CartItem.create({
      cartId: cart.id,      // padrão do model (propriedade TS)
      productId: product.id,
      quantity: 1,
      price: product.price,
      total: product.price,
    })
  }

  // redireciona pro carrinho (mais seguro que back)
  return response.redirect().toRoute('cart.show')
}



  async remove({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const cart = await Cart.findBy('user_id', user.id)
    if (!cart) {
      return response.redirect().toRoute('cart.show')
    }

    const productId = params.productId

    const item = await CartItem
      .query()
      .where('cart_id', cart.id)
      .where('product_id', productId)
      .first()

    if (item) {
      await item.delete()
    }

    return response.redirect().toRoute('cart.show')
  }

}
