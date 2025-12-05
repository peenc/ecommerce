import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
 showRegister({ view, auth, response }: HttpContext) {
  if (auth.user) {
    return response.redirect('/')
  }
  return view.render('pages/register')
}

  async register({ request, response, session }: HttpContext) {
    const schema = vine.object({
      fullName: vine.string().trim(),
      email: vine.string().email(),
      password: vine.string().minLength(6),
    })

    const validator = vine.compile(schema)

    try {
      const data = await validator.validate(request.all())
      const user = await User.create(data)
      console.log('Cadastro realizado:', user)

      session.flash('success', 'Conta criada com sucesso! Faça login para continuar.')
      return response.redirect('/login')
    } catch (error) {
      if (error.messages) {
        session.flash('errors', error.messages)
        session.flash('formData', request.only(['fullName', 'email']))
        console.log('Erros de validação:', error.messages)
        return response.redirect().back()
      }
      throw error
    }
  }
showLogin({ view, auth, response }: HttpContext) {
  const user = auth.user || null

  if (user) {
    return response.redirect().toRoute('home', { auth: { user } })
  }

  return view.render('pages/login', {
    auth: { user }
  })
}

  async login({ request, response, session, auth }: HttpContext) {
  const { email, password } = request.only(['email', 'password'])

  try {
    // Buscar o usuário pelo email
    const user = await User.findBy('email', email)
      if (!user) {
      session.flash('error', 'Email ou senha incorretos.')
      return response.redirect().back()
    }

    // Verificar a senha usando o mesmo driver que hashou
        const isPasswordValid = await hash.use('scrypt').verify(user.password,password)
        if (!isPasswordValid) {
            session.flash('error', 'Email ou senha incorretos.')
      return response.redirect().back()
    }

    // Logar manualmente 
    await auth.use('web').login(user)
       
    session.flash('success', `Bem-vindo de volta, ${user.fullName}!`)
    return response.redirect('/')
  } catch (error) {
    console.error('Erro no login manual:', error)
    session.flash('error', 'Ocorreu um erro ao tentar logar.')
    return response.redirect().back()
  }
}

  async logout({ auth, response }: HttpContext) {
  await auth.use('web').logout()
  return response.redirect('/') 
}

}
