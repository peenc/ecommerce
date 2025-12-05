import type { HttpContext } from '@adonisjs/core/http'

export default class AdminMiddleware {
  async handle({ auth, response, view }: HttpContext, next: () => Promise<void>) {
    const user = auth.user

    if (!user || user.role !== 'admin') {
      return response.status(404).send(await view.render('pages/errors/not_found'))
    }

    await next()
  }
}
