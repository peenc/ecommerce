import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import Product from '#models/product'
import Image from '#models/image'
import { createProductValidator } from '#validators/product'
import app from '@adonisjs/core/services/app'
import fs from 'fs'


export default class ProductsController {

  public async index({ view, auth }: HttpContext) {
    const products = await Product.query().preload('images')

    let user = null
    try {
      await auth.authenticate()
      user = auth.user
    } catch { }

    return view.render('pages/products/index', {
      products,
      auth: { user },
    })
  }

public async show({ params, view, auth, response }: HttpContext) {
  let product = null

  try {
    product = await Product.findOrFail(params.id)
    await product.load('images')
  } catch {
    return response.status(404).send(await view.render('pages/errors/not_found'))
  }

  let user = null
  try {
    await auth.authenticate()
    user = auth.user
  } catch {}

  return view.render('pages/products/show', { 
    product,
    auth: { user },
  })
}

  public async create({ view, auth }: HttpContext) {
    let user = null
    try {
      await auth.authenticate()
      user = auth.user
    } catch { }

    return view.render('pages/products/create', {
      auth: { user },
    })
  }

  public async edit({ params, view, auth }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    let user = null
    try {
      await auth.authenticate()
      user = auth.user
    } catch { }

    return view.render('pages/products/create', { 
      product,
      auth: { user },
    })
  }

  public async store({ request, response, auth }: HttpContext) {
    await auth.authenticate()
    try {
      const payload = await request.validateUsing(createProductValidator)

      const product = await Product.create({
        name: payload.name,
        description: payload.description,
        price: payload.price,
      })

      const image = new Image()
      image.name = `${cuid()}.${payload.image.extname}`
      image.productId = product.id

      await payload.image.move(app.makePath('tmp/uploads'), {
        name: image.name,
      })

      await image.save()

      return response.redirect().toRoute('products.show', { id: product.id })
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      return response.badRequest('Erro ao criar produto')
    }
  }

public async update({ params, request, response, auth }: HttpContext) {
  await auth.authenticate()
  const product = await Product.findOrFail(params.id)

  const payload = await request.validateUsing(createProductValidator)

  // Atualiza os campos básicos
  product.merge({
    name: payload.name,
    price: payload.price,
    description: payload.description,
  })

  await product.save()

  if (payload.image) {
    const oldImages = await product.related('images').query()
    for (const img of oldImages) {
      const filePath = app.makePath('tmp/uploads', img.name)

      try {
        await fs.promises.unlink(filePath)
      } catch (e) {
        console.warn(`Não foi possível deletar ${filePath}`)
      }

      await img.delete()
    }

    const file = payload.image
    const newImage = new Image()

    newImage.name = `${cuid()}.${file.extname}`
    newImage.productId = product.id

    await file.move(app.makePath('tmp/uploads'), {
      name: newImage.name,
    })

    await newImage.save()
  }

  return response.redirect().toRoute('products.show', { id: product.id })
}


  public async destroy({ params, response, auth }: HttpContext) {
    await auth.authenticate()
    const product = await Product.findOrFail(params.id)
    await product.delete()

    return response.redirect().toRoute('products.index')
  }

  public async addStock({ params, request, response, auth }: HttpContext) {
    await auth.authenticate()
    const product = await Product.findOrFail(params.id)
    const amount = request.input('amount')

    product.stock += Number(amount)
    await product.save()

    return response.redirect().back()
  }

  public async removeStock({ params, request, response, auth }: HttpContext) {
  await auth.authenticate()

  const product = await Product.findOrFail(params.id)
  const amount = Number(request.input('amount'))

  // evita estoque negativo
  if (product.stock - amount < 0) {
    return response.badRequest('Estoque não pode ficar negativo')
  }

  product.stock -= amount
  await product.save()

  return response.redirect().back()
}

}
