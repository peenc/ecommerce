import { BaseCommand } from '@adonisjs/core/ace'
import User from '#models/user'

export default class UpdateUserRole extends BaseCommand {
  public static commandName = 'user:set-role'
  public static description = 'Altera a role de um usuário específico'

  public static options = {
    startApp: true,
  }

  public async run() {
    const email = 'administrador@admin.com'
    const newRole = 'admin'

    const user = await User.findBy('email', email)

    if (!user) {
      console.log('Usuário não encontrado.')
      return
    }

    user.role = newRole
    await user.save()

    console.log(`✔️ Role do usuário ${email} alterada para: ${newRole}`)
  }
}
