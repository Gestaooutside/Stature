// Formulário de pagamento com Cartão de Crédito
// Coleta dados do cartão e processa pagamento

'use client';

import { useState } from 'react';
import { CreditCard, Lock, User, Mail, Phone, MapPin } from 'lucide-react';
import { CreditCardData, CreditCardHolderInfo } from '@/lib/types/payment';
import { cn } from '@/lib/utils';

interface CreditCardFormProps {
  onSubmit: (cardData: CreditCardData, holderInfo: CreditCardHolderInfo) => void;
  customerName: string;
  customerEmail: string;
  customerCpfCnpj: string;
  customerPhone: string;
  customerPostalCode: string;
  customerAddressNumber: string;
  loading?: boolean;
}

/**
 * Componente de formulário de cartão de crédito
 * Valida e coleta dados do cartão e do titular
 */
export function CreditCardForm({
  onSubmit,
  customerName,
  customerEmail,
  customerCpfCnpj,
  customerPhone,
  customerPostalCode,
  customerAddressNumber,
  loading = false,
}: CreditCardFormProps) {
  // Estado dos dados do cartão
  const [cardData, setCardData] = useState<CreditCardData>({
    holderName: customerName,
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
  });

  const [expiryInput, setExpiryInput] = useState('');

  // Estado dos dados do titular (pré-preenchido com dados do cliente)
  // mobilePhone é obrigatório conforme documentação ASAAS para pagamentos de cartão
  const [holderInfo, setHolderInfo] = useState<CreditCardHolderInfo>({
    name: customerName,
    email: customerEmail,
    cpfCnpj: customerCpfCnpj,
    postalCode: customerPostalCode,
    addressNumber: customerAddressNumber,
    addressComplement: '',
    phone: customerPhone,
    mobilePhone: customerPhone, // Usa mesmo telefone como mobilePhone (obrigatório para ASAAS)
  });

  const [errors, setErrors] = useState<any>({});

  /**
   * Detecta bandeira do cartão pelo número
   */
  const detectCardBrand = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');

    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    if (/^35/.test(cleaned)) return 'jcb';

    return 'generic';
  };

  /**
   * Formata número do cartão enquanto digita
   */
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  /**
   * Valida número do cartão (algoritmo de Luhn)
   */
  const validateCardNumber = (number: string): boolean => {
    const cleaned = number.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  /**
   * Valida data de validade
   * expiryYear agora está no formato YYYY (4 dígitos) conforme ASAAS
   */
  const validateExpiry = (month: string, year: string): boolean => {
    if (!month || !year) return false;

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12) return false;
    
    // Valida que o ano está no formato YYYY (4 dígitos)
    if (year.length !== 4) return false;

    const now = new Date();
    const currentYear = now.getFullYear(); // Ano completo (ex: 2024)
    const currentMonth = now.getMonth() + 1;

    if (yearNum < currentYear) return false;
    if (yearNum === currentYear && monthNum < currentMonth) return false;

    return true;
  };

  /**
   * Valida todos os campos
   */
  const validateForm = (): boolean => {
    const newErrors: any = {};

    // Validações do cartão
    if (!cardData.holderName.trim() || cardData.holderName.trim().length < 3) {
      newErrors.holderName = 'Nome no cartão inválido';
    }

    if (!validateCardNumber(cardData.number)) {
      newErrors.number = 'Número do cartão inválido';
    }

    if (!validateExpiry(cardData.expiryMonth, cardData.expiryYear)) {
      newErrors.expiry = 'Data de validade inválida';
    }

    if (!cardData.ccv || cardData.ccv.length < 3) {
      newErrors.ccv = 'CVV inválido';
    }

    // Validações do titular
    if (!holderInfo.name.trim()) {
      newErrors.holderInfoName = 'Nome do titular é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manipula mudança nos campos do cartão
   */
  const handleCardChange = (field: keyof CreditCardData, value: string) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Manipula mudança nos campos do titular
   */
  const handleHolderChange = (field: keyof CreditCardHolderInfo, value: string) => {
    setHolderInfo((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Manipula entrada da data de validade
   * Usuário digita MM/AA, mas armazenamos expiryYear no formato YYYY para ASAAS
   */
  const handleExpiryChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    let display = cleaned;

    if (cleaned.length >= 3) {
      display = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }

    setExpiryInput(display);
    
    // Converte ano de 2 dígitos (AA) para 4 dígitos (YYYY) conforme exigido pelo ASAAS
    // Exemplo: "24" → "2024", "30" → "2030"
    const twoDigitYear = cleaned.length >= 3 ? cleaned.slice(2, 4) : '';
    const fullYear = twoDigitYear ? `20${twoDigitYear}` : '';
    
    setCardData((prev) => ({
      ...prev,
      expiryMonth: cleaned.slice(0, 2),
      expiryYear: fullYear,
    }));

    if (errors.expiry) {
      setErrors((prev: any) => ({ ...prev, expiry: undefined }));
    }
  };

  /**
   * Submete formulário
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(cardData, holderInfo);
    }
  };

  const cardBrand = detectCardBrand(cardData.number);
  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-3 border-b border-neutral-200 pb-3 md:pb-4">
        <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-[var(--color-brand-primary)]" />
        <div>
          <h3 className="text-base md:text-lg lg:text-xl font-semibold text-neutral-900">
            Pagamento com Cartão de Crédito
          </h3>
          <p className="text-xs md:text-sm text-neutral-600">
            Preencha os dados do seu cartão
          </p>
        </div>
      </div>

      {/* Dados do Cartão */}
      <div className="space-y-3 md:space-y-4">
        <h4 className="text-sm md:text-base font-semibold text-neutral-900">
          Dados do Cartão
        </h4>

        {/* Nome no cartão */}
        <div>
          <label
            htmlFor="holderName"
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700 mb-1.5 md:mb-2"
          >
            <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Nome no Cartão
          </label>
          <input
            id="holderName"
            type="text"
            value={cardData.holderName}
            onChange={(e) => handleCardChange('holderName', e.target.value.toUpperCase())}
            placeholder="NOME COMO ESTÁ NO CARTÃO"
            disabled={loading}
            className={cn(
              'w-full rounded-lg border px-3 py-2 md:px-4 md:py-3 text-sm md:text-base uppercase transition-all',
              'placeholder:text-neutral-400 placeholder:normal-case',
              'focus:outline-none focus:ring-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              errors.holderName
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'border-neutral-200 bg-white focus:border-[#a89a8d] focus:ring-[#a89a8d]/20'
            )}
          />
          {errors.holderName && (
            <p className="mt-1 text-xs md:text-sm text-red-600">{errors.holderName}</p>
          )}
        </div>

        {/* Número do cartão */}
        <div>
          <label
            htmlFor="cardNumber"
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700 mb-1.5 md:mb-2"
          >
            <CreditCard className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Número do Cartão
          </label>
          <div className="relative">
            <input
              id="cardNumber"
              type="text"
              value={cardData.number}
              onChange={(e) => handleCardChange('number', formatCardNumber(e.target.value))}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              disabled={loading}
              className={cn(
                'w-full rounded-lg border px-3 py-2 md:px-4 md:py-3 pr-12 text-sm md:text-base font-mono transition-all',
                'placeholder:text-neutral-400',
                'focus:outline-none focus:ring-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                errors.number
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                  : 'border-neutral-200 bg-white focus:border-[#a89a8d] focus:ring-[#a89a8d]/20'
              )}
            />
            {cardBrand !== 'generic' && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="text-xs md:text-sm font-semibold text-neutral-500 uppercase">
                  {cardBrand}
                </div>
              </div>
            )}
          </div>
          {errors.number && (
            <p className="mt-1 text-xs md:text-sm text-red-600">{errors.number}</p>
          )}
        </div>

        {/* Validade e CVV */}
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {/* Data de validade */}
          <div>
            <label
              htmlFor="expiry"
              className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700 mb-1.5 md:mb-2"
            >
              Validade
            </label>
            <input
              id="expiry"
              type="text"
              value={expiryInput}
              onChange={(e) => handleExpiryChange(e.target.value)}
              placeholder="MM/AA"
              maxLength={5}
              disabled={loading}
              className={cn(
                'w-full rounded-lg border px-3 py-2 md:px-4 md:py-3 text-sm md:text-base font-mono transition-all',
                'placeholder:text-neutral-400',
                'focus:outline-none focus:ring-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                errors.expiry
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                  : 'border-neutral-200 bg-white focus:border-[#a89a8d] focus:ring-[#a89a8d]/20'
              )}
            />
            {errors.expiry && (
              <p className="mt-1 text-xs md:text-sm text-red-600">{errors.expiry}</p>
            )}
          </div>

          {/* CVV */}
          <div>
            <label
              htmlFor="ccv"
              className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700 mb-1.5 md:mb-2"
            >
              <Lock className="h-3.5 w-3.5 md:h-4 md:w-4" />
              CVV
            </label>
            <input
              id="ccv"
              type="text"
              value={cardData.ccv}
              onChange={(e) => handleCardChange('ccv', e.target.value.replace(/\D/g, ''))}
              placeholder="123"
              maxLength={4}
              disabled={loading}
              className={cn(
                'w-full rounded-lg border px-3 py-2 md:px-4 md:py-3 text-sm md:text-base font-mono transition-all',
                'placeholder:text-neutral-400',
                'focus:outline-none focus:ring-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                errors.ccv
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                  : 'border-neutral-200 bg-white focus:border-[#a89a8d] focus:ring-[#a89a8d]/20'
              )}
            />
            {errors.ccv && (
              <p className="mt-1 text-xs md:text-sm text-red-600">{errors.ccv}</p>
            )}
          </div>
        </div>
      </div>

      {/* Informações de Segurança */}
      <div className="rounded-lg md:rounded-xl bg-gradient-to-br from-[#a89a8d]/10 to-[#a89a8d]/5 p-3 md:p-4 border-2 border-[#a89a8d]/20">
        <div className="flex gap-2 md:gap-3">
          <Lock className="h-4 w-4 md:h-5 md:w-5 text-[#8d7f72] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs md:text-sm font-semibold text-neutral-900">
              Pagamento 100% Seguro
            </p>
            <p className="mt-1 text-xs md:text-sm text-neutral-700">
              Seus dados são criptografados e protegidos. Não armazenamos
              informações do seu cartão.
            </p>
          </div>
        </div>
      </div>

      {/* Botão de submit */}
      <button
        type="submit"
        disabled={loading}
        className={cn(
          'w-full rounded-lg px-4 py-3 md:px-6 md:py-4 text-sm md:text-base font-semibold text-white transition-all duration-300',
          'flex items-center justify-center gap-2',
          loading
            ? 'cursor-not-allowed bg-neutral-400'
            : 'bg-[#a89a8d] hover:bg-[#8d7f72] active:scale-95'
        )}
      >
        <Lock className="h-4 w-4 md:h-5 md:w-5" />
        {loading ? 'Processando...' : 'Pagar com Cartão de Crédito'}
      </button>
    </form>
  );
}
