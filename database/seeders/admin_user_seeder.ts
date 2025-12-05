import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import hash from '@adonisjs/core/services/hash'




export default class AdminUserSeeder extends BaseSeeder {
  public async run() {
    await User.updateOrCreate(
      { email: 'admin@gmail.com' },
      {
        fullName: 'Administrador',
        email: 'admin@gmail.com',
        password: await hash.use('scrypt').make('admin123'),
        role: 'admin'
      }
    )
  }
}
