import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.DEFAULT_USER_EMAIL || 'wilson@vasterfocus.com';
  const timezone = process.env.DEFAULT_TIMEZONE || 'America/Lima';

  const user = await prisma.user.upsert({
    where: { email },
    update: { timezone },
    create: {
      email,
      timezone,
    },
  });

  console.log(`[Seed] Default user ensured: ${user.email} (${user.id}) with timezone ${user.timezone}`);
}

main()
  .catch((e) => {
    console.error('[Seed] Error running seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });