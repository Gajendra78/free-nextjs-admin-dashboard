import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create default permissions
  const permissions = await Promise.all([
    prisma.permission.create({ data: { name: 'READ_USERS', description: 'Can read users' } }),
    prisma.permission.create({ data: { name: 'WRITE_USERS', description: 'Can create/update users' } }),
    prisma.permission.create({ data: { name: 'DELETE_USERS', description: 'Can delete users' } }),
    // Add more permissions as needed
  ])

  // Create roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'System Administrator',
      permissions: {
        connect: permissions.map(p => ({ id: p.id }))
      }
    }
  })

  const userRole = await prisma.role.create({
    data: {
      name: 'USER',
      description: 'Regular User',
      permissions: {
        connect: [{ id: permissions[0].id }] // Only READ_USERS permission
      }
    }
  })

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', Number(process.env.SALT_ROUNDS))
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      roleId: adminRole.id
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })