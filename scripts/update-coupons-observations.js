#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Ler o arquivo
const filePath = path.join(__dirname, '..', 'components/admin/coupons-table-new.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Adicionar observations no formData
content = content.replace(
  /const \[formData, setFormData\] = useState\(\{([^}]+)\}\);/,
  (match, group) => {
    // Adicionar observations após description
    const updatedGroup = group.replace(
      'description: "",',
      'description: "",\n    observations: "",'
    );
    return `const [formData, setFormData] = useState({${updatedGroup}});`;
  }
);

// 2. Adicionar campo no formulário após descrição
content = content.replace(
  /(<\/div>\s*\n\s*<div>\s*<\/div>\s*\n\s*{\/\* Prescritor com Autocomplete \*\/})/,
  `</div>

          <div>
            <label className="block text-xs font-medium mb-1">Observações</label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Observações internas sobre este cupom"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm resize-none"
              rows={3}
            />
          </div>

          {/* Prescritor com Autocomplete */}`
);

// 3. Adicionar header da coluna na tabela
content = content.replace(
  /(<th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Descrição<\/th>\s*\)}\s*\n\s*{isColumnVisible\('discountType'\)/,
  `<th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Descrição</th>
                )}
                {isColumnVisible('observations') && (
                  <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Observações</th>
                )}
                {isColumnVisible('discountType')`
);

// 4. Adicionar célula na tabela
content = content.replace(
  /({isColumnVisible\('description'\) && \(\s*<td className="py-3 px-4">{item\.coupon\.description}<\/td>\s*\)}\s*\n\s*{\/\* Tipo Desconto \*\/)/,
  `{isColumnVisible('description') && (
                      <td className="py-3 px-4">{item.coupon.description}</td>
                    )}

                    {/* Observações */}
                    {isColumnVisible('observations') && (
                      <td className="py-3 px-4">
                        {item.coupon.observations ? (
                          <span className="text-sm text-neutral-600" title={item.coupon.observations}>
                            {item.coupon.observations.length > 50
                              ? \`\${item.coupon.observations.substring(0, 50)}...\`
                              : item.coupon.observations
                            }
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-xs">—</span>
                        )}
                      </td>
                    )}

                    {/* Tipo Desconto */}`
);

// 5. Adicionar nas funções de startEdit e startDuplicate
content = content.replace(
  /description: coupon\.description,\s*isActive: coupon\.isActive,/g,
  `description: coupon.description,
      observations: coupon.observations || "",
      isActive: coupon.isActive,`
);

// 6. Adicionar na validação anti-duplicata
content = content.replace(
  /formData\.description === originalData\.description,\s*formData\.isActive === originalData\.isActive,/g,
  `formData.description === originalData.description,
          formData.observations === originalData.observations,
          formData.isActive === originalData.isActive,`
);

// 7. Adicionar no payload do save
content = content.replace(
  /description: formData\.description,\s*isActive: formData\.isActive,/g,
  `description: formData.description,
        observations: formData.observations || null,
        isActive: formData.isActive,`
);

// Salvar o arquivo
fs.writeFileSync(filePath, content);
console.log('✅ Arquivo coupons-table-new.tsx atualizado com sucesso!');