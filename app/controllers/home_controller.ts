import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'

export default class HomeController {
  public async index({ view, auth }: HttpContext) {
    // Tentar autenticar, mas não quebrar se não houver usuário
    let user = null
    try {
      await auth.authenticate()
      user = auth.user
    } catch {
      user = null
    }

    const products = await Product.query().preload('images')

    return view.render('pages/home', {
      products,
      auth: { user },
    })
  }
}
