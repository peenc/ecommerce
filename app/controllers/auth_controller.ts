import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  showRegister({ view }: HttpContext) {
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
      // Cria usuário, hash é gerado pelo AuthFinder automaticamente
      const user = await User.create(data)
      console.log('✅ Cadastro realizado:', user)

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

  try {
    // 🔍 Buscar o usuário pelo email
    const user = await User.findBy('email', email)
    console.log(user)
    if (!user) {
      session.flash('error', 'Email ou senha incorretos.')
      return response.redirect().back()
    }

    // 🔑 Verificar a senha usando o mesmo driver que hashou
    console.log(password)
    const isPasswordValid = await hash.use('scrypt').verify(user.password,password)
    console.log(password)
    if (!isPasswordValid) {
      console.log("senha inválida")
      console.log(password)
      console.log(user.password)
      session.flash('error', 'Email ou senha incorretos.')
      return response.redirect().back()
    }

    // 🚪 Logar manualmente com o guard 'web'
    await auth.use('web').login(user)
    console.log(user)

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
    return response.redirect('/login')
  }
}
