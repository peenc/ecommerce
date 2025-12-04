import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  
  public async edit({ view, auth, response }: HttpContextContract) {
    try {
      await auth.authenticate()
      const user = auth.user || null
      return view.render('pages/users/profile', { user, auth: { user } })
    } catch {
      return response.redirect().toRoute('auth.login.show')
    }
  }

  public async update({ request, auth, response }: HttpContextContract) {
    await auth.authenticate()
    const user = auth.user || null
    if (!user) {
      return response.redirect().toRoute('auth.login.show')
    }

    const data = request.only(['fullName', 'email'])
    user.merge(data)
    await user.save()

    return response.redirect().toRoute('user.profile.edit')
  }
}
