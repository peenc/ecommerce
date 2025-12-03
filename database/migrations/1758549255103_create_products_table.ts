import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name', 255).notNullable()
      table.decimal('price', 10, 2).notNullable()
      table.text('description').notNullable()

      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
      table.integer('stock').notNullable().defaultTo(0)

    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
