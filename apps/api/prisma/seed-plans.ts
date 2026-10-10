import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding plans...');

  const plans = [
    {
      code: 'free',
      name: 'رایگان',
      description: 'برای شروع و آشنایی با راتایار',
      priceMonthly: BigInt(0),
      priceYearly: BigInt(0),
      maxMembers: 1,
      maxObligations: 5,
      maxAssets: 10,
      maxDocuments: 1,
      maxStorageMB: 50,
      maxUploadMB: 1,
      isPopular: false,
      sortOrder: 0,
      features: {
        sms_reminder: true,
        push_reminder: false,
        family_dashboard: false,
        customer_card: false,
        reports: 'basic',
        support: 'email',
      },
    },
    {
      code: 'personal',
      name: 'شخصی',
      description: 'برای فردی که می‌خواهد زندگی‌اش را منظم کند',
      priceMonthly: BigInt(199000),
      priceYearly: BigInt(1990000), // 2 ماه رایگان
      maxMembers: 1,
      maxObligations: 30,
      maxAssets: 30,
      maxDocuments: 5,
      maxStorageMB: 500,
      maxUploadMB: 2,
      isPopular: false,
      sortOrder: 1,
      features: {
        sms_reminder: true,
        push_reminder: true,
        family_dashboard: false,
        customer_card: false,
        reports: 'full',
        support: 'chat',
      },
    },
    {
      code: 'family',
      name: 'خانواده',
      description: 'برای خانواده‌ها (تا ۴ کاربر)',
      priceMonthly: BigInt(499000),
      priceYearly: BigInt(4990000),
      maxMembers: 4,
      maxObligations: -1, // unlimited
      maxAssets: -1,
      maxDocuments: 20,
      maxStorageMB: 2048, // 2 GB
      maxUploadMB: 2,
      isPopular: true,
      sortOrder: 2,
      features: {
        sms_reminder: true,
        push_reminder: true,
        family_dashboard: true,
        customer_card: false,
        reports: 'family',
        support: 'priority',
      },
    },
    {
      code: 'business',
      name: 'کسب‌وکار',
      description: 'برای کسب‌وکارها و مغازه‌ها (تا ۱۰ کاربر)',
      priceMonthly: BigInt(4999000),
      priceYearly: BigInt(49990000),
      maxMembers: 10,
      maxObligations: -1,
      maxAssets: -1,
      maxDocuments: -1,
      maxStorageMB: 5120, // 5 GB
      maxUploadMB: 2,
      isPopular: false,
      sortOrder: 3,
      features: {
        sms_reminder: true,
        push_reminder: true,
        family_dashboard: true,
        customer_card: true,
        reports: 'business',
        support: 'dedicated',
        api_access: true,
      },
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
    console.log(`✅ Plan "${plan.name}" (${plan.code})`);
  }

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
