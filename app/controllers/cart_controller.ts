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

  async add({ auth, request, response, session }: HttpContext) {
  const user = auth.user!
  let cart = await Cart.findBy('user_id', user.id)
  if (!cart) {
    cart = await Cart.create({ userId: user.id })
  }

  const productId = request.input('productId')
  const product = await Product.findOrFail(productId)

  let item = await CartItem
    .query()
    .where('cart_id', cart.id)
    .where('product_id', product.id)
    .first()

  let message = ''

  if (item) {
    if (item.quantity + 1 > product.stock) {
      message = `Estoque insuficiente para ${product.name}. Máximo disponível: ${product.stock}`
    } else {
      item.quantity++
      item.total = Number((item.quantity * Number(item.price)).toFixed(2))
      await item.save()
    }
  } else {
    if (product.stock < 1) {
      message = `Produto sem estoque: ${product.name}`
    } else {
      item = await CartItem.create({
        cartId: cart.id,
        productId: product.id,
        quantity: 1,
        price: product.price,
        total: product.price,
      })
    }
  }

  if (message) {
    // guarda a mensagem na sessão para mostrar no carrinho
    session.flash('error', message)
  }

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

  async checkout({ auth, response }) {
    const user = auth.user!
    const cart = await Cart
      .query()
      .where('user_id', user.id)
      .preload('items', i => i.preload('product'))
      .firstOrFail()

    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        return response.badRequest({
          error: `Estoque insuficiente para ${item.product.name}`
        })
      }
    }

    // desconta do estoque
    for (const item of cart.items) {
      item.product.stock -= item.quantity
      await item.product.save()
    }

    // aqui você criaria o pedido

    // limpa carrinho
    await cart.related('items').query().delete()

    return response.ok({ message: 'Compra finalizada!' })
}

async increase({ auth, params, response }: HttpContext) {
  const user = auth.user!
  const cart = await Cart.findByOrFail('user_id', user.id)

  const item = await CartItem
    .query()
    .where('cart_id', cart.id)
    .where('product_id', params.productId)
    .preload('product')
    .firstOrFail()

  if (item.quantity + 1 > item.product.stock) {
    return response.badRequest('Estoque insuficiente')
  }

  item.quantity++
  item.total = item.quantity * item.price
  await item.save()

  return response.redirect().toRoute('cart.show')
}

async decrease({ auth, params, response }: HttpContext) {
  const user = auth.user!
  const cart = await Cart.findByOrFail('user_id', user.id)

  const item = await CartItem
    .query()
    .where('cart_id', cart.id)
    .where('product_id', params.productId)
    .firstOrFail()

  if (item.quantity === 1) {
    await item.delete()
  } else {
    item.quantity--
    item.total = item.quantity * item.price
    await item.save()
  }

  return response.redirect().toRoute('cart.show')
}


}
