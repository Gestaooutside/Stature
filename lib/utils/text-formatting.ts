/**
 * Utilitários para formatação de texto
 */

/**
 * Converte string para Title Case (Primeira Letra Maiúscula em Cada Palavra)
 * 
 * Exceções comuns em português que ficam minúsculas:
 * - Preposições: de, da, do, dos, das
 * - Conjunções: e, ou
 * 
 * @param str - String a ser convertida
 * @returns String formatada em Title Case
 * 
 * @example
 * toTitleCase("MARIA SILVA") → "Maria Silva"
 * toTitleCase("joão dos santos") → "João dos Santos"
 * toTitleCase("ana PAULA") → "Ana Paula"
 * toTitleCase("jose de oliveira") → "Jose de Oliveira"
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  
  // Palavras que devem ficar em minúscula (exceto se forem a primeira palavra)
  const exceptions = ['de', 'da', 'do', 'dos', 'das', 'e', 'ou'];
  
  return str
    .toLowerCase()
    .trim()
    .split(' ')
    .filter(word => word.length > 0) // Remove espaços extras
    .map((word, index) => {
      // Primeira palavra sempre maiúscula
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      
      // Exceções mantêm minúscula
      if (exceptions.includes(word)) {
        return word;
      }
      
      // Demais palavras em Title Case
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Formata string removendo espaços extras e normalizando
 * 
 * @param str - String a ser normalizada
 * @returns String normalizada
 * 
 * @example
 * normalizeString("  João   Silva  ") → "João Silva"
 */
export function normalizeString(str: string): string {
  if (!str) return '';
  
  return str
    .trim()
    .replace(/\s+/g, ' '); // Substitui múltiplos espaços por um único
}

/**
 * Hook de formatação para inputs de nome
 * Aplica Title Case automaticamente durante digitação
 * 
 * @param value - Valor atual do input
 * @param onChange - Callback para atualizar valor
 * @returns Objeto com props para o input
 * 
 * @example
 * const nameProps = useTitleCaseInput(formData.name, (value) => 
 *   setFormData({ ...formData, name: value })
 * );
 * <Input {...nameProps} />
 */
export function useTitleCaseInput(
  value: string,
  onChange: (value: string) => void
) {
  return {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = toTitleCase(e.target.value);
      onChange(formatted);
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      // Normaliza ao sair do campo (remove espaços extras)
      const normalized = normalizeString(e.target.value);
      onChange(toTitleCase(normalized));
    },
  };
}
