import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  showRegister({ view }: HttpContext) {
    return view.render('pages/register')
  }

  async register({ request, response, session }: HttpContext) {
  console.log('📩 Recebi o cadastro:', request.all())

  const schema = vine.object({
    fullName: vine.string().trim(),
    email: vine.string().email(),
    password: vine.string().minLength(6),
  })

  const validator = vine.compile(schema)

  try {
    const data = await validator.validate(request.all())
    const user = await User.create(data)
    console.log('✅ Cadastro REALIZADOOOOOOOOO', user)

    // 👇 Apenas redireciona ao login
    session.flash('success', 'Conta criada com sucesso! Faça login para continuar.')
    return response.redirect('/login')

  } catch (error) {
    if (error.messages) {
      session.flash('errors', error.messages)
      session.flash('formData', request.only(['fullName', 'email']))
      console.log('❌ Erros de validação:', error.messages)
      return response.redirect().back()
    }

    throw error
  }
}

  showLogin({ view }: HttpContext) {
    return view.render('pages/login')
  }

  async login({ request, response, session, auth }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    // 🔍 Buscar o usuário no banco
    const user = await User.findBy('email', email)

    if (!user) {
      session.flash('error', 'Email ou senha incorretos.')
      return response.redirect().back()
    }

    // 🔑 Verificar senha
    const isPasswordValid = await hash.verify(user.password, password)
    console.log('Resultado da verificação de senha:', isPasswordValid)

    if (!isPasswordValid) {
      session.flash('error', 'Email ou senha incorretos.')
      return response.redirect().back()
    }

    // 🚪 Login com o guard 'web'
    await auth.use('web').login(user)

    session.flash('success', `Bem-vindo de volta, ${user.fullName}!`)
    return response.redirect('/')
  }

  async logout({ auth, response }: HttpContext) {
    await auth.logout()
    return response.redirect('/login')
  }
}
