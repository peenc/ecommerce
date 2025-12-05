// app/controllers/HomeController.ts
import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'

export default class HomeController {
  public async index({ view, auth, request }: HttpContext) {
    let user = null
    try {
      await auth.authenticate()
      user = auth.user
    } catch {}

    const page = Number(request.input('page', 1))
    const perPage = 8

    const paginator = await Product.query()
      .preload('images')
      .paginate(page, perPage)

    paginator.baseUrl('/')

    const pagination = paginator.toJSON()

    console.log("PAGINATION RAW:", pagination) // DEBUG

    const meta = pagination.meta
    const productsData = pagination.data

    const pages = []
    for (let i = 1; i <= meta.last_page; i++) {
      pages.push({
        number: i,
        url: `/?page=${i}`,
        isActive: i === meta.current_page
      })
    }

    return view.render('pages/home', {
      productsData,
      meta,
      pages,
      auth: { user },
    })
  }
}
