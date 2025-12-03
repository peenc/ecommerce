import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'

import Product from '#models/product'

import { createProductValidator } from '#validators/product'
import app from '@adonisjs/core/services/app'
import Image from '#models/image'

export default class ProductsController {
  public async index({ view }: HttpContext) {
    const products = await Product.all()

    return view.render('pages/products/index', { products })
  }

  public async show({ params, view, auth }: HttpContext) {
    await auth.authenticate()
    const product = await Product.findOrFail(params.id)
    await product.load('images')

    return view.render('pages/products/show', { product, auth: { user: auth.user || null }})
  }

  public async create({ view ,auth  }: HttpContext) {
    await auth.authenticate()
    return view.render('pages/products/create')
  }

  public async edit({ params, view, auth}: HttpContext) {
    await auth.authenticate()
    const product = await Product.findOrFail(params.id)

    return view.render('pages/products/create', { product })
  }

  public async store({ request, response, auth}: HttpContext) {
  console.log('📦 Recebendo requisição de criação de produto...')
  await auth.authenticate()
  try {
    const payload = await request.validateUsing(createProductValidator)
    console.log('✅ Validação passou:', payload)

    const product = await Product.create({
      name: payload.name,
      description: payload.description,
      price: payload.price,
    })
    console.log('✅ Produto criado no banco:', product)

    const image = new Image()
    image.name = `${cuid()}.${payload.image.extname}`
    image.productId = product.id
    console.log('🖼️ Preparando upload da imagem:', image.name)

    await payload.image.move(app.makePath('tmp/uploads'), {
      name: image.name,
    })
    console.log('✅ Imagem movida para tmp/uploads')

    await image.save()
    console.log('✅ Imagem salva no banco:', image)

    return response.redirect().toRoute('products.show', { id: product.id })
  } catch (error) {
    console.error('❌ Erro ao criar produto:', error)
    return response.badRequest('Erro ao criar produto')
  }
}


  public async update({ params, request, response, auth }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    await auth.authenticate()

    const payload = await request.validateUsing(createProductValidator)

    product.merge(payload)
    await product.save()

    return response.redirect().toRoute('products.show', { id: product.id })
  }

  public async destroy({ params, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    await product.delete()

    return response.redirect().toRoute('products.index')
  }
}
