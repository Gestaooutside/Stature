**# CLAUDE.md - Diretrizes de Desenvolvimento do Projeto**

> Instruções para Claude-Code ao trabalhar neste projeto

---

**## 📋 ÍNDICE**

1. [Gerenciamento de Pacotes](<u>#gerenciamento-de-pacotes</u>)
2. [Documentação de Código](<u>#documentação-de-código</u>)
3. [Controle de Versão](<u>#controle-de-versão</u>)
4. [Comandos Rápidos](<u>#comandos-rápidos</u>)

---

**## 📦 GERENCIAMENTO DE PACOTES**

**### Regra Absoluta de Tooling**

****SEMPRE utilize `pnpm` com Turbopack em vez de `npm`****

**### Comandos Padrão**

```bash
# ❌ NUNCA USE
npm install
npm run dev
npm run build

# ✅ SEMPRE USE
pnpm install
pnpm dev --turbopack
pnpm build
```

**### Mapeamento Completo**

| Operação | Comando Correto |
|----------|----------------|
| Instalar dependências | `pnpm install` ou `pnpm i` |
| Desenvolvimento | `pnpm dev --turbopack` |
| Build produção | `pnpm build` |
| Executar produção | `pnpm start` |
| Testes | `pnpm test` |
| Adicionar pacote | `pnpm add [pacote]` |
| Adicionar dev dependency | `pnpm add -D [pacote]` |
| Remover pacote | `pnpm remove [pacote]` |
| Atualizar dependências | `pnpm update` |

**### Scripts em package.json**

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

---

**## 📝 DOCUMENTAÇÃO DE CÓDIGO**

**### Princípios de Documentação**

Ao escrever código, aplicar as seguintes diretrizes de forma ****concisa mas efetiva****:

**#### Comentários Obrigatórios**

****Nível de Arquivo:****
```typescript
// Gerencia autenticação de usuários via JWT
// Dependências: jsonwebtoken, bcrypt
```

****Nível de Função/Método:****
```typescript
/**
 * Valida e decodifica token JWT
 * @param token - Token JWT a ser validado
 * @returns Payload decodificado do usuário
 * @throws Error se token inválido ou expirado
 */
```

****Nível de Bloco Lógico:****
```typescript
// Aplica desconto progressivo sobre preço original
// Garante que desconto máximo não exceda 30%
if (quantity >= 10) {
  discount = Math.min(basePrice * 0.3, calculateTieredDiscount(quantity));
}
```

****Nível de Linha:****
```typescript
const MAX_RETRIES = 3; // Tentativas antes de falha permanente
await delay(1000); // Aguarda 1s entre requisições para rate limiting
```

**### Estrutura de Comentários**

```typescript
// ✅ BOM - Explica o porquê e contexto
// Usa hash SHA-256 porque bcrypt é lento para tokens de curta duração
const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

// ❌ RUIM - Apenas repete o código
// Cria hash do token
const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
```

**### Validação de Documentação**

Antes de finalizar código, verificar:
- [ ] Todas as funções públicas estão documentadas
- [ ] Lógica complexa tem explicação clara
- [ ] Comentários estão em português brasileiro correto
- [ ] Não há comentários redundantes ou óbvios
- [ ] Documentação facilita onboarding de novos desenvolvedores

---

**## 🔄 CONTROLE DE VERSÃO**

**### Política de Commits**

****Regras Absolutas:****
- ✅ Commits em português brasileiro
- ✅ Mensagens claras e descritivas
- ✅ Commits frequentes e atômicos
- ❌ ****NUNCA usar co-authoring**** (Co-authored-by proibido)
- ❌ NUNCA commits genéricos tipo "updates" ou "fixes"

**### Formato de Commit**

```
<tipo>(<escopo>): <descrição imperativa em pt-br max 72 chars>

[Corpo explicativo detalhando:]
- O que foi alterado especificamente
- Por que a mudança foi necessária
- Como a mudança resolve o problema
- Impacto ou efeitos colaterais relevantes

[Rodapé opcional:]
Refs #issue-number
Closes #issue-number
```

**### Tipos de Commit Válidos**

| Tipo | Uso | Exemplo |
|------|-----|---------|
| `feat` | Nova funcionalidade | `feat(auth): adiciona login com Google OAuth` |
| `fix` | Correção de bug | `fix(checkout): corrige cálculo de frete` |
| `refactor` | Refatoração | `refactor(api): extrai lógica para helper` |
| `docs` | Documentação | `docs(readme): adiciona guia de setup` |
| `style` | Formatação | `style(components): formata com prettier` |
| `test` | Testes | `test(auth): adiciona testes de validação` |
| `perf` | Performance | `perf(dashboard): otimiza renderização` |
| `chore` | Manutenção | `chore(deps): atualiza dependências` |

**### Exemplos de Commits Corretos**

****Nova Funcionalidade:****
```
feat(autenticação): adiciona validação de token JWT

Implementa middleware de validação de tokens JWT para
proteger rotas autenticadas da API.

- Verifica assinatura e expiração do token
- Extrai e valida claims do usuário
- Retorna 401 para tokens inválidos ou expirados
- Adiciona testes unitários de validação

Melhora segurança da API.
```

****Correção de Bug:****
```
fix(checkout): corrige cálculo de desconto progressivo

Desconto estava sendo aplicado sobre valor já descontado,
resultando em descontos maiores que o esperado.

- Aplica desconto sobre preço original
- Adiciona validação para máximo de 30%
- Inclui testes para diferentes cenários

Closes #456
```

****Refatoração:****
```
refactor(database): extrai queries para repository pattern

Move queries SQL dos controllers para classes repository
dedicadas, melhorando organização e testabilidade.

- Cria UserRepository com métodos tipados
- Migra 12 queries para nova estrutura
- Facilita mocking em testes
- Sem mudança no comportamento da aplicação
```

**### Workflow de Commit e Push**

****Processo Passo a Passo:****

```bash
# 1. Verificar mudanças
git status

# 2. Adicionar arquivos específicos (não use git add .)
git add src/components/Auth.tsx
git add src/utils/jwt.ts

# 3. Criar commit com mensagem estruturada
git commit -m "tipo(escopo): descrição

- Detalhe 1
- Detalhe 2"

# 4. Push para branch atual
git push origin $(git branch --show-current)
```

**### Checklist Pré-Commit**

Antes de cada commit, verificar:

****Código:****
- [ ] Código compila/executa sem erros
- [ ] Testes relevantes passam
- [ ] Não há console.logs ou debuggers
- [ ] Segue padrões do projeto
- [ ] Sem credenciais ou dados sensíveis

****Mensagem:****
- [ ] Tipo de commit correto
- [ ] Descrição em português brasileiro
- [ ] Descrição clara e específica
- [ ] Formato segue convenção
- [ ] ****SEM co-authoring****

****Contexto:****
- [ ] Apenas mudanças relacionadas
- [ ] Escopo apropriado
- [ ] Mudança completa e funcional
- [ ] Documentação atualizada

**### Validação Final**

```bash
# Revisar últimos commits
git log --oneline -10

# Verificar ausência de co-authoring
git log --grep="Co-authored-by" --oneline
```

Garantir que TODOS os commits:
- [x] Mensagens em português brasileiro
- [x] Formato `<tipo>(<escopo>): <descrição>`
- [x] ****ZERO co-authoring****
- [x] Código compila individualmente
- [x] Mensagens claras e descritivas

---

**## ⚡ COMANDOS RÁPIDOS**

**### Setup Inicial**

```bash
# Clonar repositório
git clone [url]

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env.local
```

**### Desenvolvimento**

```bash
# Iniciar servidor de desenvolvimento
pnpm dev --turbopack

# Executar testes
pnpm test

# Executar linter
pnpm lint

# Formatar código
pnpm format
```

**### Build e Deploy**

```bash
# Build de produção
pnpm build

# Testar build localmente
pnpm start

# Analisar bundle
pnpm analyze
```

**### Git Workflow Diário**

```bash
# Atualizar branch
git pull origin main

# Criar feature branch
git checkout -b feature/nome-descritivo

# Após desenvolvimento
git add [arquivos específicos]
git commit -m "tipo(escopo): descrição"
git push origin feature/nome-descritivo
```

---

**## 🎯 PRIORIDADES**

Ao trabalhar neste projeto, sempre:

1. ****Use pnpm com Turbopack**** - Nunca npm
2. ****Documente código**** - Comentários concisos em pt-br
3. ****Commits frequentes**** - Pequenos, claros, sem co-authoring
4. ****Código limpo**** - Testado e funcional antes de commit
5. ****Push regular**** - Sincronize com GitHub frequentemente

---

**## ❌ PROIBIÇÕES ABSOLUTAS**

- ❌ Usar `npm` em vez de `pnpm`
- ❌ Omitir flag `--turbopack` no comando dev
- ❌ Incluir `Co-authored-by` em commits
- ❌ Commits vagos tipo "updates" ou "fixes"
- ❌ Commitar código que não compila
- ❌ Usar inglês nas mensagens de commit
- ❌ Commits sem documentação inline adequada
- ❌ Fazer `git add .` sem revisar mudanças
