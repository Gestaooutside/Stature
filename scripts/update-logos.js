#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Lista de arquivos para atualizar
const files = [
  'app/admin/commissions/page.tsx',
  'app/admin/coupons/page.tsx',
  'app/admin/dashboard/page.tsx',
  'app/admin/leads/page.tsx',
  'app/admin/payouts/page.tsx',
  'app/admin/prescribers/page.tsx',
  'app/admin/products/page.tsx',
  'app/admin/representatives/page.tsx',
  'app/admin/sales/page.tsx'
];

// Padrão para remover
const oldLogoIconPattern = /const LogoIcon = \(\) => \(\s*<div className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">\s*<div className="h-5 w-6 bg-black rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" \/>\s*<\/div>\s*\);/gs;

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Verificar se tem o LogoIcon customizado
    if (oldLogoIconPattern.test(content)) {
      // Remover o LogoIcon customizado
      content = content.replace(oldLogoIconPattern, '');

      // Adicionar import do LogoIcon
      if (!content.includes('import { LogoIcon }')) {
        content = content.replace(
          'import { cn } from "@/lib/utils";',
          'import { cn } from "@/lib/utils";\nimport { LogoIcon } from "@/lib/components/LogoIcon";'
        );
      }

      fs.writeFileSync(filePath, content);
      console.log(`✅ Atualizado: ${file}`);
    } else {
      console.log(`⏭️  Ignorado (sem LogoIcon customizado): ${file}`);
    }
  } else {
    console.log(`❌ Arquivo não encontrado: ${file}`);
  }
});