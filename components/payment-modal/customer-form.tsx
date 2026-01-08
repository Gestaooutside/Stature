// Formulário de dados do cliente para pagamento
// Coleta nome, email, CPF, telefone e endereço

'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, CreditCard, MessageCircle, IdCard, BadgeCheck } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart-store';
import { CustomerFormData } from '@/lib/types/payment';
import { cn } from '@/lib/utils';

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  onBack?: () => void;
}

/**
 * Componente de formulário de dados do cliente
 * Valida e coleta informações necessárias para criar cliente no Asaas
 */
export function CustomerForm({ onSubmit, onBack }: CustomerFormProps) {
  const { customer, setCustomer, whatsapp, setWhatsapp } = useCartStore();
  const cartItems = useCartStore((state) => state.items);

  // Estado do formulário com valores iniciais do store ou vazios
  const [formData, setFormData] = useState<CustomerFormData>(
    customer || {
      name: '',
      email: '',
      cpfCnpj: '',
      rg: '',
      rgIssuer: '',
      phone: '',
      postalCode: '',
      address: '',
      addressNumber: '',
      addressComplement: '',
      city: '',
      state: '',
    }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});
  const [whatsappValue, setWhatsappValue] = useState<string>(whatsapp || '');
  const [whatsappError, setWhatsappError] = useState<string | undefined>(undefined);

  /**
   * Formata CPF/CNPJ enquanto digita
   */
  const formatCpfCnpj = (value: string) => {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length <= 11) {
      // Formato CPF: 000.000.000-00
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // Formato CNPJ: 00.000.000/0000-00
      return cleaned
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  };

  /**
   * Formata telefone enquanto digita
   */
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length <= 10) {
      // Formato: (00) 0000-0000
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      // Formato: (00) 00000-0000
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  };

  /**
   * Formata CEP enquanto digita
   */
  const formatCep = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{5})(\d)/, '$1-$2');
  };

  /**
   * Valida email
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Valida CPF usando algoritmo de verificação de dígitos
   * Verifica se os dígitos verificadores estão corretos
   */
  const validateCpf = (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, '');
    
    if (cleaned.length !== 11) return false;
    
    // Rejeita CPFs com todos os dígitos iguais (ex: 111.111.111-11)
    if (/^(\d)\1+$/.test(cleaned)) return false;
    
    // Calcula primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned[9])) return false;
    
    // Calcula segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned[10])) return false;
    
    return true;
  };

  /**
   * Valida CNPJ usando algoritmo de verificação de dígitos
   * Verifica se os dígitos verificadores estão corretos
   */
  const validateCnpj = (cnpj: string): boolean => {
    const cleaned = cnpj.replace(/\D/g, '');
    
    if (cleaned.length !== 14) return false;
    
    // Rejeita CNPJs com todos os dígitos iguais
    if (/^(\d)\1+$/.test(cleaned)) return false;
    
    // Calcula primeiro dígito verificador
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned[i]) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(cleaned[12])) return false;
    
    // Calcula segundo dígito verificador
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned[i]) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    if (digit2 !== parseInt(cleaned[13])) return false;
    
    return true;
  };

  /**
   * Valida CPF/CNPJ usando algoritmo de verificação
   * Detecta automaticamente se é CPF (11 dígitos) ou CNPJ (14 dígitos)
   */
  const validateCpfCnpj = (cpfCnpj: string): boolean => {
    const cleaned = cpfCnpj.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return validateCpf(cleaned);
    }
    
    if (cleaned.length === 14) {
      return validateCnpj(cleaned);
    }
    
    return false;
  };

  /**
   * Valida telefone
   */
  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  /**
   * Valida CEP
   */
  const validateCep = (cep: string): boolean => {
    const cleaned = cep.replace(/\D/g, '');
    return cleaned.length === 8;
  };

  /**
   * Valida todos os campos
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerFormData, string>> = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!validateCpfCnpj(formData.cpfCnpj)) {
      newErrors.cpfCnpj = 'CPF/CNPJ inválido';
    }

    if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Telefone inválido';
    }

    const rgClean = formData.rg?.replace(/\D/g, '') || '';
    if (!rgClean || rgClean.length < 5) {
      newErrors.rg = 'RG inválido';
    }

    if (!formData.rgIssuer?.trim()) {
      newErrors.rgIssuer = 'Órgão emissor é obrigatório';
    }

    if (!validateCep(formData.postalCode)) {
      newErrors.postalCode = 'CEP inválido';
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    if (!formData.addressNumber.trim()) {
      newErrors.addressNumber = 'Número é obrigatório';
    }

    if (!formData.city?.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }

    if (!formData.state?.trim()) {
      newErrors.state = 'Estado é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manipula mudança nos inputs
   */
  const handleChange = (field: keyof CustomerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpa erro do campo ao digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Submete formulário e captura lead
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const baseValid = validateForm();
    const isWhatsappValid = validatePhone(whatsappValue);
    if (!isWhatsappValid) {
      setWhatsappError('WhatsApp inválido');
    }

    if (baseValid && isWhatsappValid) {
      setWhatsapp(whatsappValue);
      setCustomer(formData);

      // Captura lead do checkout
      await captureCheckoutLead();

      onSubmit(formData);
    }
  };

  /**
   * Captura lead do checkout para API
   */
  const captureCheckoutLead = async () => {
    try {
      // Prepara dados do lead
      const cartItemsPayload = cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const leadData = {
        sourceType: 'checkout' as const,
        name: formData.name.trim(),
        whatsapp: whatsappValue,
        email: formData.email.trim(),
        cpfCnpj: formData.cpfCnpj,
        rg: formData.rg,
        rgIssuer: formData.rgIssuer,
        phone: formData.phone,
        postalCode: formData.postalCode,
        address: formData.address,
        addressNumber: formData.addressNumber,
        addressComplement: formData.addressComplement,
        city: formData.city,
        state: formData.state,
        cartItems: cartItemsPayload,
      };

      // Envia lead para API de forma assíncrona (não bloqueia o fluxo)
      fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      })
        .then(async (response) => {
          const data = await response.json();
          if (response.ok) {
            console.log('Lead de checkout capturado com sucesso:', data.lead.id);
          } else {
            console.error('Erro ao capturar lead de checkout:', data.error);
          }
        })
        .catch(error => {
          console.error('Erro de rede ao capturar lead de checkout:', error);
        });

    } catch (error) {
      console.error('Erro ao preparar lead de checkout:', error);
    }
  };

  return (
    <form id="customer-form" onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-3 border-b border-neutral-200 pb-3 md:pb-4">
        <User className="h-5 w-5 md:h-6 md:w-6 text-[var(--color-brand-primary)]" />
        <div>
          <h3 className="text-base md:text-lg lg:text-xl font-semibold text-neutral-900">
            Dados Pessoais
          </h3>
          <p className="text-xs md:text-sm text-neutral-600">
            Preencha seus dados para prosseguir com o pagamento
          </p>
        </div>
      </div>

      {/* Grid de campos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-5">
        {/* Nome completo */}
        <div className="md:col-span-2">
          <label
            htmlFor="name"
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700 mb-1.5 md:mb-2"
          >
            <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Nome Completo
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Digite seu nome completo"
            className={cn(
              'w-full rounded-lg border px-3 py-2 md:px-4 md:py-3 text-sm md:text-base transition-all',
              'placeholder:text-neutral-400',
              'focus:outline-none focus:ring-2',
              errors.name
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'border-neutral-200 bg-white focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20'
            )}
          />
          {errors.name && (
            <p className="mt-1 text-xs md:text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700 mb-1.5 md:mb-2"
          >
            <Mail className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="seu@email.com"
            className={cn(
              'w-full rounded-lg border px-3 py-2 md:px-4 md:py-3 text-sm md:text-base transition-all',
              'placeholder:text-neutral-400',
              'focus:outline-none focus:ring-2',
              errors.email
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'border-neutral-200 bg-white focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20'
            )}
          />
          {errors.email && (
            <p className="mt-1 text-xs md:text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* CPF/CNPJ */}
        <div>
          <label
            htmlFor="cpfCnpj"
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700 mb-1.5 md:mb-2"
          >
            <CreditCard className="h-3.5 w-3.5 md:h-4 md:w-4" />
            CPF/CNPJ
          </label>
          <input
            id="cpfCnpj"
            type="text"
            value={formData.cpfCnpj}
            onChange={(e) => handleChange('cpfCnpj', formatCpfCnpj(e.target.value))}
            placeholder="000.000.000-00"
            maxLength={18}
            className={cn(
              'w-full rounded-lg border px-3 py-2 md:px-4 md:py-3 text-sm md:text-base transition-all',
              'placeholder:text-neutral-400',
              'focus:outline-none focus:ring-2',
              errors.cpfCnpj
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'border-neutral-200 bg-white focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20'
            )}
          />
          {errors.cpfCnpj && (
            <p className="mt-1 text-xs md:text-sm text-red-600">{errors.cpfCnpj}</p>
          )}
        </div>

        {/* RG */}
        <div>
          <label
            htmlFor="rg"
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700 mb-1.5 md:mb-2"
          >
            <IdCard className="h-3.5 w-3.5 md:h-4 md:w-4" />
            RG
          </label>
          <input
            id="rg"
            type="text"
            value={formData.rg}
            onChange={(e) => handleChange('rg', e.target.value.toUpperCase())}
            placeholder="00.000.000-0"
            maxLength={20}
            className={cn(
              'w-full rounded-lg border px-3 py-2 md:px-4 md:py-3 text-sm md:text-base transition-all',
              'placeholder:text-neutral-400',
              'focus:outline-none focus:ring-2',
              errors.rg
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'border-neutral-200 bg-white focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20'
            )}
          />
          {errors.rg && (
            <p className="mt-1 text-xs md:text-sm text-red-600">{errors.rg}</p>
          )}
        </div>

        {/* Órgão Emissor */}
        <div>
          <label
            htmlFor="rgIssuer"
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700 mb-1.5 md:mb-2"
          >
            <BadgeCheck className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Órgão Emissor
          </label>
          <input
            id="rgIssuer"
            type="text"
            value={formData.rgIssuer}
            onChange={(e) => handleChange('rgIssuer', e.target.value.toUpperCase())}
            placeholder="Ex: SSP-SP"
            maxLength={20}
            className={cn(
              'w-full rounded-lg border px-3 py-2 md:px-4 md:py-3 text-sm md:text-base transition-all',
              'placeholder:text-neutral-400',
              'focus:outline-none focus:ring-2',
              errors.rgIssuer
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'border-neutral-200 bg-white focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20'
            )}
          />
          {errors.rgIssuer && (
            <p className="mt-1 text-xs md:text-sm text-red-600">{errors.rgIssuer}</p>
          )}
        </div>

        {/* Telefone */}
        <div>
          <label
            htmlFor="phone"
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700 mb-1.5 md:mb-2"
          >
            <Phone className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Telefone
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
            placeholder="(00) 00000-0000"
            maxLength={15}
            className={cn(
              'w-full rounded-lg border px-3 py-2 md:px-4 md:py-3 text-sm md:text-base transition-all',
              'placeholder:text-neutral-400',
              'focus:outline-none focus:ring-2',
              errors.phone
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'border-neutral-200 bg-white focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20'
            )}
          />
          {errors.phone && (
            <p className="mt-1 text-xs md:text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* WhatsApp (obrigatório, não enviado ao Asaas) */}
        <div>
          <label
            htmlFor="whatsapp"
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700 mb-1.5 md:mb-2"
          >
            <MessageCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
            WhatsApp
          </label>
          <input
            id="whatsapp"
            type="tel"
            required
            value={whatsappValue}
            onChange={(e) => {
              setWhatsappValue(formatPhone(e.target.value));
              if (whatsappError) setWhatsappError(undefined);
            }}
            placeholder="(00) 00000-0000"
            maxLength={15}
            className={cn(
              'w-full rounded-lg border px-3 py-2 md:px-4 md:py-3 text-sm md:text-base transition-all',
              'placeholder:text-neutral-400',
              'focus:outline-none focus:ring-2',
              whatsappError
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'border-neutral-200 bg-white focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20'
            )}
          />
          {whatsappError && (
            <p className="mt-1 text-xs md:text-sm text-red-600">{whatsappError}</p>
          )}
        </div>

        {/* CEP */}
        <div>
          <label
            htmlFor="postalCode"
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700 mb-1.5 md:mb-2"
          >
            <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
            CEP
          </label>
          <input
            id="postalCode"
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleChange('postalCode', formatCep(e.target.value))}
            placeholder="00000-000"
            maxLength={9}
            className={cn(
              'w-full rounded-lg border px-3 py-2 md:px-4 md:py-3 text-sm md:text-base transition-all',
              'placeholder:text-neutral-400',
              'focus:outline-none focus:ring-2',
              errors.postalCode
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'border-neutral-200 bg-white focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20'
            )}
          />
          {errors.postalCode && (
            <p className="mt-1 text-xs md:text-sm text-red-600">
              {errors.postalCode}
            </p>
          )}
        </div>

        {/* Endereço Completo */}
        <div className="md:col-span-2">
          <label
            htmlFor="address"
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700 mb-1.5 md:mb-2"
          >
            Endereço Completo (Rua, Av, etc)
          </label>
          <input
            id="address"
            type="text"
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Ex: Av. Paulista"
            className={cn(
              'w-full rounded-lg border px-3 py-2 md:px-4 md:py-3 text-sm md:text-base transition-all',
              'placeholder:text-neutral-400',
              'focus:outline-none focus:ring-2',
              errors.address
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'border-neutral-200 bg-white focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20'
            )}
          />
          {errors.address && (
            <p className="mt-1 text-xs md:text-sm text-red-600">
              {errors.address}
            </p>
          )}
        </div>

        {/* Número */}
        <div>
          <label
            htmlFor="addressNumber"
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700 mb-1.5 md:mb-2"
          >
            Número
          </label>
          <input
            id="addressNumber"
            type="text"
            value={formData.addressNumber}
            onChange={(e) => handleChange('addressNumber', e.target.value)}
            placeholder="123"
            className={cn(
              'w-full rounded-lg border px-3 py-2 md:px-4 md:py-3 text-sm md:text-base transition-all',
              'placeholder:text-neutral-400',
              'focus:outline-none focus:ring-2',
              errors.addressNumber
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'border-neutral-200 bg-white focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20'
            )}
          />
          {errors.addressNumber && (
            <p className="mt-1 text-xs md:text-sm text-red-600">
              {errors.addressNumber}
            </p>
          )}
        </div>

        {/* Complemento (opcional) */}
        <div>
          <label
            htmlFor="addressComplement"
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700 mb-1.5 md:mb-2"
          >
            Complemento <span className="text-neutral-500">(opcional)</span>
          </label>
          <input
            id="addressComplement"
            type="text"
            value={formData.addressComplement || ''}
            onChange={(e) => handleChange('addressComplement', e.target.value)}
            placeholder="Apto, bloco, etc"
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 md:px-4 md:py-3 text-sm md:text-base transition-all placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20"
          />
        </div>

        {/* Cidade */}
        <div>
          <label
            htmlFor="city"
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700 mb-1.5 md:mb-2"
          >
            Cidade
          </label>
          <input
            id="city"
            type="text"
            value={formData.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="São Paulo"
            className={cn(
              'w-full rounded-lg border px-3 py-2 md:px-4 md:py-3 text-sm md:text-base transition-all',
              'placeholder:text-neutral-400',
              'focus:outline-none focus:ring-2',
              errors.city
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'border-neutral-200 bg-white focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20'
            )}
          />
          {errors.city && (
            <p className="mt-1 text-xs md:text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        {/* Estado */}
        <div>
          <label
            htmlFor="state"
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700 mb-1.5 md:mb-2"
          >
            Estado
          </label>
          <select
            id="state"
            value={formData.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            className={cn(
              'w-full rounded-lg border px-3 py-2 md:px-4 md:py-3 text-sm md:text-base transition-all',
              'focus:outline-none focus:ring-2',
              !formData.state && 'text-neutral-400',
              errors.state
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'border-neutral-200 bg-white focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20'
            )}
          >
            <option value="">Selecione</option>
            <option value="AC">AC</option>
            <option value="AL">AL</option>
            <option value="AP">AP</option>
            <option value="AM">AM</option>
            <option value="BA">BA</option>
            <option value="CE">CE</option>
            <option value="DF">DF</option>
            <option value="ES">ES</option>
            <option value="GO">GO</option>
            <option value="MA">MA</option>
            <option value="MT">MT</option>
            <option value="MS">MS</option>
            <option value="MG">MG</option>
            <option value="PA">PA</option>
            <option value="PB">PB</option>
            <option value="PR">PR</option>
            <option value="PE">PE</option>
            <option value="PI">PI</option>
            <option value="RJ">RJ</option>
            <option value="RN">RN</option>
            <option value="RS">RS</option>
            <option value="RO">RO</option>
            <option value="RR">RR</option>
            <option value="SC">SC</option>
            <option value="SP">SP</option>
            <option value="SE">SE</option>
            <option value="TO">TO</option>
          </select>
          {errors.state && (
            <p className="mt-1 text-xs md:text-sm text-red-600">{errors.state}</p>
          )}
        </div>
      </div>

    </form>
  );
}
