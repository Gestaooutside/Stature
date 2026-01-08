// Documento de Termos de Uso
// Conteúdo baseado no produto e serviços do site DUO NATURAL

export function TermsOfUseContent() {
  return (
    <div className="space-y-6 text-neutral-700 leading-relaxed">
      <p className="text-sm text-neutral-500">
        Última atualização: {new Date().toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">1. Aceitação dos Termos</h2>
        <p>
          Ao acessar e utilizar o site da DUO NATURAL e adquirir nossos produtos, você concorda
          integralmente com estes Termos de Uso. Se você não concordar com qualquer parte destes
          termos, não utilize nossos serviços.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">2. Sobre o Produto</h2>
        <p className="mb-3">
          DUO NATURAL é um sistema natural 360º composto por duas fórmulas complementares:
        </p>

        <div className="ml-4 mb-4">
          <h3 className="font-semibold text-neutral-900 mb-2">DUO DIA (Cápsulas)</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Fórmula com ingredientes 100% naturais</li>
            <li>Ingredientes principais: Vitamina D, Triptofano, L-Fenilalanina, Passiflora, Eritrina,
                L-Teanina, LipoArtich II, Magnésio Taurato, Valeriana, Picolinato de Cromo</li>
            <li>Finalidade: controle de ansiedade e compulsão alimentar durante o dia</li>
            <li>Uso recomendado: 1-2 cápsulas pela manhã</li>
            <li>Preço: R$ 179,99</li>
          </ul>
        </div>

        <div className="ml-4 mb-4">
          <h3 className="font-semibold text-neutral-900 mb-2">DUO NOITE (Gotas sublinguais)</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Fórmula líquida com absorção otimizada</li>
            <li>Ingredientes principais: Melatonina, Vitaminas B6/B9/B12, Magnésio L-Treonato,
                Piridoxal-5-Fosfato, Melissa, Pepper Pro R, Sorbitol</li>
            <li>Finalidade: sono profundo e reparador</li>
            <li>Uso recomendado: 2-4 gotas sublinguais 30 minutos antes de dormir</li>
            <li>Preço: R$ 179,99</li>
          </ul>
        </div>

        <div className="ml-4">
          <h3 className="font-semibold text-neutral-900 mb-2">KIT COMPLETO</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Inclui: DUO DIA + DUO NOITE</li>
            <li>Preço: R$ 299,99</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">3. Natureza do Produto</h2>
        <p>
          Os produtos DUO NATURAL são suplementos alimentares compostos por ingredientes naturais.
          Características:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>100% natural, sem dependência química</li>
          <li>Sem efeitos colaterais relatados</li>
          <li>Fórmulas aprovadas e com certificações de qualidade e pureza</li>
          <li>Ingredientes premium com certificação de origem</li>
          <li>Produção sob rígidos padrões de qualidade</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">4. Compra e Pagamento</h2>
        <p className="mb-3">
          Ao realizar uma compra em nosso site, você concorda com os seguintes termos:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Os preços exibidos são em Reais (R$) e podem ser alterados sem aviso prévio</li>
          <li>O processamento do pagamento é realizado através da plataforma ASAAS Gestão Financeira</li>
          <li>Aceitamos as seguintes formas de pagamento: cartão de crédito, PIX e boleto bancário</li>
          <li>As transações são criptografadas e protegidas com tecnologia de ponta</li>
          <li>O pedido só será processado após a confirmação do pagamento</li>
          <li>Você receberá confirmação do pedido por e-mail após a aprovação do pagamento</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">5. Entrega e Rastreamento</h2>
        <p>
          Após a confirmação do pagamento, seu pedido será processado e enviado para o endereço fornecido.
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>Você receberá um código de rastreamento por e-mail</li>
          <li>É possível acompanhar cada etapa da entrega em tempo real</li>
          <li>Envio transparente com atualização do status</li>
          <li>A entrega é realizada através de empresas de transporte parceiras</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">6. Garantias e Qualidade</h2>
        <p className="mb-3">A DUO NATURAL garante:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>100% Seguro:</strong> fórmulas aprovadas, sem efeitos colaterais relatados,
              com certificações de qualidade e pureza</li>
          <li><strong>Pagamento Protegido:</strong> transações criptografadas e seguras, dados
              protegidos com tecnologia de ponta</li>
          <li><strong>Envio Transparente:</strong> código de rastreio e acompanhamento em tempo real</li>
          <li><strong>Qualidade Garantida:</strong> ingredientes premium com certificação de origem,
              produção sob rígidos padrões</li>
        </ul>
        <p className="mt-3">
          Estatísticas: mais de 620.000 cápsulas vendidas com 97% de aprovação dos clientes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">7. Uso Adequado do Produto</h2>
        <p className="mb-3">
          <strong>IMPORTANTE:</strong> Os produtos DUO NATURAL são suplementos alimentares e:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>NÃO substituem tratamento médico, psicológico ou psiquiátrico</li>
          <li>NÃO devem ser usados como única forma de tratamento para condições de saúde</li>
          <li>Devem ser utilizados de acordo com as recomendações de uso</li>
          <li>Consulte um médico antes de iniciar o uso, especialmente se você:
            <ul className="list-circle pl-6 mt-2 space-y-1">
              <li>Possui condições médicas pré-existentes</li>
              <li>Está em tratamento com medicamentos</li>
              <li>Está grávida ou amamentando</li>
              <li>É menor de 18 anos</li>
            </ul>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">8. Limitações de Responsabilidade</h2>
        <p>
          A DUO NATURAL não se responsabiliza por:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>Uso inadequado ou em desacordo com as recomendações</li>
          <li>Reações adversas não relatadas durante testes e uso regular</li>
          <li>Resultados individuais, que podem variar de pessoa para pessoa</li>
          <li>Atrasos na entrega causados por transportadoras ou eventos fora do nosso controle</li>
          <li>Problemas técnicos temporários no site ou sistemas de pagamento</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">9. Propriedade Intelectual</h2>
        <p>
          Todo o conteúdo do site, incluindo textos, imagens, logotipos, design, fórmulas e
          marca DUO NATURAL, é protegido por direitos autorais e propriedade intelectual.
        </p>
        <p className="mt-3">
          É proibida a reprodução, distribuição ou uso comercial sem autorização prévia por escrito.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">10. Privacidade de Dados</h2>
        <p>
          O tratamento de dados pessoais está descrito em nossa Política de Privacidade, que
          faz parte integrante destes Termos de Uso.
        </p>
        <p className="mt-3">
          Ao utilizar nosso site e serviços, você concorda com a coleta e uso de dados conforme
          descrito na Política de Privacidade.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">11. Alterações nos Termos</h2>
        <p>
          Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento.
          Alterações significativas serão comunicadas através do site ou por e-mail.
        </p>
        <p className="mt-3">
          O uso contínuo do site após alterações constitui aceitação dos novos termos.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">12. Lei Aplicável e Foro</h2>
        <p>
          Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
        </p>
        <p className="mt-3">
          Quaisquer disputas ou controvérsias serão resolvidas de acordo com a legislação brasileira,
          incluindo o Código de Defesa do Consumidor (Lei nº 8.078/1990) e a Lei Geral de Proteção
          de Dados (Lei nº 13.709/2018).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">13. Contato</h2>
        <p>
          Para dúvidas, suporte ou solicitações relacionadas a estes Termos de Uso, entre em
          contato conosco:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>
            <strong>WhatsApp:</strong>{' '}
            <a
              href="https://wa.me/5561931688859"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a89a8d] hover:underline"
            >
              +55 61 9316-8859
            </a>
          </li>
          <li><strong>Email:</strong> contato@duonatural.com.br</li>
        </ul>
      </section>
    </div>
  )
}
