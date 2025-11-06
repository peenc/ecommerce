import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async edit({ view, auth }: HttpContext) {
    const user = auth.user
    return view.render('pages/profile', { user })
  }

  async update({ request, auth, response }: HttpContext) {
    const user = auth.user!
    const data = request.only(['email'])
    user.merge(data)
    await user.save()
    return response.redirect('/profile')
  }
}


