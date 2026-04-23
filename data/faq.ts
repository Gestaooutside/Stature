/**
 * Perguntas frequentes sobre alongamento ósseo, Stature Clinic.
 *
 * Conteúdo alinhado com o lançamento da tecnologia Fitbone,
 * a expansão cirúrgica para 5 capitais e a mensagem padrão
 * de 8 cm no fêmur / 6 cm na tíbia.
 */

import { LENGTHENING } from '@/lib/config/brand'

export interface FaqItem {
  id: string
  question: string
  answer: string
  category?: string
}

export const faqItems: FaqItem[] = [
  {
    id: 'q1',
    category: 'Conceito',
    question: 'O que é o alongamento ósseo?',
    answer:
      'Alongamento ósseo é um método cirúrgico que promove o crescimento do osso. Pode ser utilizado para corrigir diferença de tamanho entre os membros ou para aumento de estatura em pacientes que já atingiram a maturidade óssea.',
  },
  {
    id: 'q2',
    category: 'Indicação',
    question: 'Quem pode passar pelo procedimento?',
    answer:
      'Os pacientes são cuidadosamente avaliados: idade, hábitos como tabagismo, prática de exercícios, alimentação, estado de saúde e nutricional são considerados. Pacientes que se enquadram nesses critérios são submetidos a exames de imagem para estudo ósseo.',
  },
  {
    id: 'q3',
    category: 'Técnica',
    question: 'Qual técnica é utilizada no alongamento?',
    answer:
      'A técnica principal é o Fitbone: uma haste intramedular motorizada, controlada externamente por controle remoto. Nada externo ao corpo, o alongamento acontece dentro do osso, com cicatrizes mínimas e reabilitação mais rápida. Em casos específicos de tíbia, utilizamos também o Método LON (fixador externo combinado com haste intramedular).',
  },
  {
    id: 'q4',
    category: 'Técnica',
    question: 'O que é o Fitbone e o que ele traz de diferente?',
    answer:
      'O Fitbone é uma haste intramedular motorizada aprovada pela Anvisa, acionada por controle remoto. Diferenças práticas: zero hardware externo aparente, sem limitações mecânicas (é possível dormir de lado normalmente), cicatrizes mínimas, menos desconforto e reabilitação mais rápida que métodos com fixador externo prolongado.',
  },
  {
    id: 'q5',
    category: 'Quanto cresce',
    question: 'Quantos centímetros é possível ganhar em altura?',
    answer: `${LENGTHENING.summary} ${LENGTHENING.disclaimer}`,
  },
  {
    id: 'q6',
    category: 'Duração',
    question: 'Quanto tempo dura o tratamento completo?',
    answer:
      'Em média, o processo completo leva entre 6 e 9 meses: alongamento progressivo (aproximadamente 1 mm por dia), consolidação óssea e reabilitação. Cada paciente segue um cronograma personalizado conforme evolução clínica e radiográfica.',
  },
  {
    id: 'q7',
    category: 'Recuperação',
    question: 'Como é a recuperação no dia a dia?',
    answer:
      'Caminhada liberada já no dia 1. Fisioterapia precoce e academia para membros inferiores permitidas nas semanas iniciais. Durante o tratamento é possível manter o trabalho, dirigir e ir à fisioterapia sozinho. Em torno dos 6 meses, atividades de impacto (corrida, saltos, esportes) são liberadas.',
  },
  {
    id: 'q8',
    category: 'Dor',
    question: 'O procedimento é doloroso?',
    answer:
      'A cirurgia é realizada sob anestesia e o pós-operatório é conduzido com analgesia multimodal. Com o Fitbone, o desconforto da fase de alongamento é significativamente menor que em métodos tradicionais. A maioria dos pacientes relata tolerância muito boa.',
  },
  {
    id: 'q9',
    category: 'Riscos',
    question: 'Quais são os riscos do alongamento ósseo?',
    answer:
      'Como toda cirurgia, existem riscos: infecção, retardo de consolidação, rigidez articular. O acompanhamento rigoroso, a técnica minimamente invasiva e a fisioterapia estruturada reduzem muito essas ocorrências.',
  },
  {
    id: 'q10',
    category: 'Proporção',
    question: 'Meu corpo ficará desproporcional depois do procedimento?',
    answer:
      'Não. Fazemos cálculos detalhados para manter a harmonia entre tronco, fêmures e tíbias. Quando necessário, o tratamento é distribuído entre os dois ossos para preservar a proporcionalidade.',
  },
  {
    id: 'q11',
    category: 'Cicatrizes',
    question: 'Ficarão cicatrizes visíveis?',
    answer:
      'Com o Fitbone, as incisões são pequenas e discretas. Toda a mecânica do alongamento acontece dentro do osso. As cicatrizes tendem a se tornar pouco perceptíveis após a cicatrização completa.',
  },
  {
    id: 'q12',
    category: 'Pós-tratamento',
    question: 'Após o tratamento, poderei praticar esportes normalmente?',
    answer:
      'Sim. Concluída a consolidação óssea e a reabilitação (em torno dos 6 meses), o paciente retoma todas as atividades: correr, saltar, academia, esportes de impacto. O osso formado é tão resistente quanto o original.',
  },
  {
    id: 'q13',
    category: 'Idade',
    question: 'Existe idade mínima ou máxima para o procedimento?',
    answer:
      'O paciente precisa ter maturidade óssea, geralmente a partir dos 18 anos. O limite superior depende da avaliação individual, considerando saúde óssea, cardiovascular e metabólica. Cada caso é analisado individualmente.',
  },
  {
    id: 'q14',
    category: 'Onde é feita',
    question: 'Onde é feita a cirurgia?',
    answer:
      'A cirurgia está disponível em cinco capitais: São Paulo (SP), Belo Horizonte (MG), Fortaleza (CE), Florianópolis (SC) e Uberlândia (MG). A consulta pode ser 100% online, disponível para qualquer cidade do Brasil. Você escolhe a capital mais conveniente para a cirurgia e acompanhamento.',
  },
  {
    id: 'q15',
    category: 'Pré-operatório',
    question: 'Quais exames são solicitados antes da cirurgia?',
    answer:
      'Além da avaliação clínica, são solicitados exames de imagem (radiografias e escanometria), exames laboratoriais, densitometria óssea quando indicado, avaliação cardiológica e anestésica pré-operatória.',
  },
  {
    id: 'q16',
    category: 'Fisioterapia',
    question: 'A fisioterapia é obrigatória durante o tratamento?',
    answer:
      'Sim. A fisioterapia é parte fundamental e começa no primeiro dia do pós-operatório. Ela garante manutenção de mobilidade, força muscular, prevenção de rigidez e reeducação da marcha ao longo de todo o processo.',
  },
  {
    id: 'q17',
    category: 'Contato',
    question: 'Como posso tirar outras dúvidas e agendar uma avaliação?',
    answer:
      'Entre em contato pelo WhatsApp através do botão fixo no site ou pelo Instagram @daviddemello.orto. A avaliação inicial pode ser 100% online, para qualquer cidade do Brasil.',
  },
]
