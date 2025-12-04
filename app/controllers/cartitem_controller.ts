import Cart from '#models/cart'
import CartItem from '#models/cart_item'
import Product from '#models/product'

export default class CartItemsController {
  async add({ auth, request, response }) {
    const user = auth.user!
    const { productId, quantity } = request.only(['productId', 'quantity'])

    const product = await Product.findOrFail(productId)

    // busca o carrinho do usuário
    const cart = await Cart.firstOrCreate({ userId: user.id })

    // verifica se já existe o item no carrinho
    let item = await CartItem
      .query()
      .where('cart_id', cart.id)
      .andWhere('product_id', productId)
      .first()

    if (item) {
        if (item.quantity + 1 > product.stock) {
            return response.badRequest('Estoque insuficiente')
        }

        item.quantity++
        item.total = item.quantity * item.price
        await item.save()
        } else {
        if (product.stock < 1) {
            return response.badRequest('Produto sem estoque')
        }

        item = await CartItem.create({
            cartId: cart.id,
            productId: product.id,
            quantity: 1,
            price: product.price,
            total: product.price,
        })
        }

    return response.ok(item)
  }

async update({ params, request, response }) {
  const { quantity } = request.only(['quantity'])

  const item = await CartItem.findOrFail(params.id)
  await item.load('product') // garante que temos o produto relacionado

  // valida estoque
  if (quantity > item.product.stock) {
    return response.badRequest({
      error: `Estoque insuficiente para ${item.product.name}. Máximo disponível: ${item.product.stock}`
    })
  }

  item.quantity = quantity
  item.total = quantity * item.price
  await item.save()

  return response.ok(item)
}

}
