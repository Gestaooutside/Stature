import { db } from './index';
import { users } from './schema';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

// Constantes de configuração
const SALT_ROUNDS = 12;

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Verificar variáveis de ambiente
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@duo.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!@#';
    const adminName = process.env.ADMIN_NAME || 'Administrador DUO';

    console.log(`📧 Email do admin: ${adminEmail}`);

    // Verificar se o usuário já existe
    const existingUsers = await db.select().from(users);

    if (existingUsers.length > 0) {
      console.log('⚠️  Usuários já existem no banco de dados.');
      console.log(`   Total de usuários: ${existingUsers.length}`);
      console.log('   Execute este script apenas em um banco vazio.');
      process.exit(0);
    }

    // Gerar hash da senha
    console.log('🔐 Gerando hash da senha...');
    const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);

    // Criar usuário admin
    console.log('👤 Criando usuário administrador...');
    const [admin] = await db.insert(users).values({
      email: adminEmail,
      passwordHash,
      name: adminName
    }).returning();

    console.log('✅ Seed concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Nome: ${admin.name}`);
    console.log(`   Criado em: ${admin.createdAt}`);
    console.log('\n🔑 Credenciais de acesso:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${adminPassword}`);
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  }
}

seed();
