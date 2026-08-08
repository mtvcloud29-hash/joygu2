import { defineConfig } from '@prisma/internals'

export default defineConfig({
  schema: './schema.prisma',
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})
