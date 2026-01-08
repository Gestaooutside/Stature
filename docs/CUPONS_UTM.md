## 📋 Formato do Link

### URL Base
```
https://www.duonatural.com.br/checkout
```

### Parâmetros suportados (escolha um):
- `cupom` (recomendado em português)
- `coupon`
- `utm_coupon`

---

## 🔗 Exemplos de Links

### Cupom simples:
```
https://www.duonatural.com.br/checkout?cupom=DESCONTO10
```

### Com UTM completo (para rastreamento de campanhas):
```
https://www.duonatural.com.br/checkout?cupom=PRIMEIRACOMPRA&utm_source=instagram&utm_medium=stories&utm_campaign=lancamento
```

### Exemplos práticos:
| Cupom | Link |
|-------|------|
| `VERAO20` | `https://www.duonatural.com.br/checkout?cupom=VERAO20` |
| `INFLUENCER15` | `https://www.duonatural.com.br/checkout?cupom=INFLUENCER15` |
| `BLACKFRIDAY` | `https://www.duonatural.com.br/checkout?cupom=BLACKFRIDAY` |

---

## ⚡ Comportamento:
- O cupom é **validado automaticamente** via API ao carregar a página
- Se válido: é **aplicado automaticamente** no campo de cupom
- Se inválido: o usuário vê o checkout normal (sem erro visível)
- Se já houver um cupom aplicado: **não sobrescreve**