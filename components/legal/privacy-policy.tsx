// Documento de Política de Privacidade
// Conteúdo baseado nas práticas do site DUO NATURAL

export function PrivacyPolicyContent() {
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
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">1. Introdução</h2>
        <p>
          A DUO NATURAL está comprometida com a proteção da sua privacidade e dos seus dados pessoais.
          Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas
          informações ao utilizar nosso site e adquirir nossos produtos.
        </p>
        <p className="mt-3">
          Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)
          e demais legislações aplicáveis.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">2. Dados Pessoais Coletados</h2>
        <p className="mb-3">Coletamos as seguintes informações quando você realiza uma compra em nosso site:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Dados de identificação:</strong> nome completo, CPF</li>
          <li><strong>Dados de contato:</strong> endereço de e-mail, número de telefone</li>
          <li><strong>Dados de endereço:</strong> endereço completo para entrega (rua, número, complemento, bairro, cidade, estado, CEP)</li>
          <li><strong>Dados de pagamento:</strong> informações processadas através do gateway ASAAS (número de cartão, CPF, dados bancários para boleto ou PIX)</li>
          <li><strong>Dados de navegação:</strong> endereço IP, tipo de navegador, páginas visitadas, tempo de permanência</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">3. Finalidade do Uso dos Dados</h2>
        <p className="mb-3">Utilizamos seus dados pessoais para:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Processar e gerenciar seus pedidos de compra</li>
          <li>Realizar o pagamento através do gateway ASAAS</li>
          <li>Entregar os produtos no endereço fornecido</li>
          <li>Enviar código de rastreamento e atualizações sobre sua entrega</li>
          <li>Comunicar sobre o status do pedido via e-mail ou telefone</li>
          <li>Emitir nota fiscal eletrônica</li>
          <li>Prestar suporte e atendimento ao cliente</li>
          <li>Melhorar nossos serviços e experiência do usuário</li>
          <li>Cumprir obrigações legais e regulatórias</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">4. Compartilhamento de Dados</h2>
        <p className="mb-3">Seus dados pessoais podem ser compartilhados com:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>ASAAS Gestão Financeira:</strong> gateway de pagamento responsável pelo processamento
            seguro das transações financeiras
          </li>
          <li>
            <strong>Empresas de transporte e logística:</strong> para viabilizar a entrega dos produtos
            e fornecer rastreamento em tempo real
          </li>
          <li>
            <strong>Prestadores de serviços:</strong> empresas que nos auxiliam em serviços de tecnologia,
            armazenamento de dados e infraestrutura
          </li>
        </ul>
        <p className="mt-3">
          Todos os parceiros são cuidadosamente selecionados e obrigados contratualmente a manter a
          confidencialidade e segurança dos seus dados.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">5. Cookies e Tecnologias Similares</h2>
        <p>
          Utilizamos cookies e tecnologias similares para melhorar sua experiência de navegação,
          analisar o desempenho do site e personalizar conteúdo. Os cookies coletam informações como
          páginas visitadas, tempo de permanência e preferências do usuário.
        </p>
        <p className="mt-3">
          Você pode gerenciar ou desativar cookies através das configurações do seu navegador. No entanto,
          isso pode afetar algumas funcionalidades do site.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">6. Segurança dos Dados</h2>
        <p>
          Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais
          contra acesso não autorizado, perda, destruição ou alteração. Isso inclui:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>Criptografia de dados sensíveis durante a transmissão (SSL/TLS)</li>
          <li>Transações de pagamento processadas através de gateway certificado (ASAAS)</li>
          <li>Acesso restrito aos dados apenas para colaboradores autorizados</li>
          <li>Monitoramento contínuo de sistemas e atividades suspeitas</li>
          <li>Backups regulares e seguros</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">7. Armazenamento e Retenção de Dados</h2>
        <p>
          Seus dados pessoais serão armazenados apenas pelo tempo necessário para cumprir as finalidades
          para as quais foram coletados, incluindo requisitos legais, contábeis ou de relatórios.
        </p>
        <p className="mt-3">
          Após o término do período de retenção, os dados serão excluídos ou anonimizados de forma
          segura e irreversível.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">8. Seus Direitos (LGPD)</h2>
        <p className="mb-3">De acordo com a LGPD, você tem os seguintes direitos:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e solicitar acesso a eles</li>
          <li><strong>Correção:</strong> solicitar a correção de dados incompletos, inexatos ou desatualizados</li>
          <li><strong>Anonimização, bloqueio ou eliminação:</strong> de dados desnecessários, excessivos ou tratados em desconformidade</li>
          <li><strong>Portabilidade:</strong> solicitar a transferência dos dados a outro fornecedor</li>
          <li><strong>Eliminação:</strong> dos dados tratados com seu consentimento</li>
          <li><strong>Informação:</strong> sobre entidades públicas e privadas com as quais compartilhamos seus dados</li>
          <li><strong>Revogação do consentimento:</strong> a qualquer momento</li>
        </ul>
        <p className="mt-3">
          Para exercer seus direitos, entre em contato através dos canais disponíveis em nosso site.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">9. Alterações nesta Política</h2>
        <p>
          Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas
          práticas ou requisitos legais. Recomendamos que você revise esta página regularmente para se
          manter informado.
        </p>
        <p className="mt-3">
          Alterações significativas serão comunicadas através do site ou por e-mail.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">10. Contato</h2>
        <p>
          Se você tiver dúvidas, preocupações ou solicitações relacionadas a esta Política de Privacidade
          ou ao tratamento de seus dados pessoais, entre em contato conosco:
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
