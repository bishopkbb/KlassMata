// prisma/seed.ts
import { PrismaClient, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const superAdminEmail = "ajibade_tosin@yahoo.com"
  const superAdminPassword = "SuperSecurePassword123!" // ✅ replace in prod

  const hashedPassword = await bcrypt.hash(superAdminPassword, 12)

  // Ensure default school exists
  let school = await prisma.school.findFirst({
    where: { name: "Default School" },
  })

  if (!school) {
    school = await prisma.school.create({
      data: {
        name: "Default School",
        address: "123 Main Street, Lagos",
        email: "admin@klassmata.com",
        phone: "+2348000000000",
      },
    })
    console.log("✅ Default school created")
  }

  // Ensure super admin exists
  let superAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  })

  if (!superAdmin) {
    superAdmin = await prisma.user.create({
      data: {
        firstName: "Tosin Francis",
        lastName: "Ajibade",
        email: superAdminEmail,
        password: hashedPassword,
        role: UserRole.super_admin, // ✅ use enum
        schoolId: school.id,
      },
    })
    console.log("✅ Super Admin created:", superAdmin.email)
  } else {
    console.log("ℹ️ Super Admin already exists:", superAdmin.email)
  }
}

main()
  .then(() => console.log("🌱 Seeding completed!"))
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
