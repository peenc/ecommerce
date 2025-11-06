import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'

export default class HomeController {
  public async index({ view }: HttpContext) {
    const products = await Product.query().preload('images')
    return view.render('pages/home', { products })
  }
}
