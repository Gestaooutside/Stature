/**
 * Perguntas frequentes sobre alongamento ósseo — Dr. David de Mello.
 *
 * Conteúdo inicial baseado nas perguntas mais comuns em consulta.
 * Substitua/complemente as respostas com as 17 perguntas oficiais
 * fornecidas pelo Dr. David antes de publicar.
 */

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
      'Os pacientes são cuidadosamente avaliados, sendo fatores importantes: idade, hábitos como tabagismo e exercícios físicos, alimentação, estado de saúde e nutricional. Pacientes que se enquadram nesses critérios são submetidos a exames de imagem para estudo ósseo.',
  },
  {
    id: 'q3',
    category: 'Técnica',
    question: 'Qual técnica é utilizada no alongamento?',
    answer:
      'Utilizamos uma combinação de fixador externo linear monolateral com haste intramedular. Essa abordagem reduz o tempo de uso do fixador externo, é menos invasiva e oferece maior conforto durante o tratamento.',
  },
  {
    id: 'q4',
    category: 'Técnica',
    question: 'Qual a diferença entre o fixador linear e o fixador de Ilizarov?',
    answer:
      'O fixador linear monolateral é posicionado em apenas um lado do membro, é mais leve, discreto e confortável que o fixador circular de Ilizarov. Ele permite maior mobilidade, facilita o uso de roupas e reduz o impacto psicológico do tratamento.',
  },
  {
    id: 'q5',
    category: 'Quanto cresce',
    question: 'Quantos centímetros é possível ganhar em altura?',
    answer:
      'No alongamento de fêmur, é comum ganhar entre 6 e 8 cm. Na tíbia, entre 5 e 7 cm. Quando indicado, é possível combinar os dois ossos em tempos diferentes. O ganho total sempre respeita a proporcionalidade corporal e o limite seguro do tecido.',
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
    question: 'Consigo andar durante o alongamento?',
    answer:
      'Sim. Com a associação do fixador externo e da haste intramedular, o paciente inicia carga parcial assistida em poucos dias. A fisioterapia é iniciada logo no pós-operatório para manter a mobilidade, força muscular e o treino de marcha.',
  },
  {
    id: 'q8',
    category: 'Dor',
    question: 'O procedimento é doloroso?',
    answer:
      'A cirurgia é realizada sob anestesia e o pós-operatório é conduzido com analgesia multimodal. Durante a fase de alongamento pode haver desconforto, controlado com medicação e fisioterapia. A maioria dos pacientes relata tolerância muito boa.',
  },
  {
    id: 'q9',
    category: 'Riscos',
    question: 'Quais são os riscos do alongamento ósseo?',
    answer:
      'Como toda cirurgia, existem riscos: infecção no trajeto dos pinos, retardo de consolidação, rigidez articular. O acompanhamento rigoroso, a técnica minimamente invasiva e a fisioterapia estruturada reduzem muito essas ocorrências.',
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
      'A técnica minimamente invasiva utiliza pequenas incisões para a colocação da haste e dos pinos do fixador. As cicatrizes são discretas e tendem a se tornar pouco perceptíveis após a cicatrização completa.',
  },
  {
    id: 'q12',
    category: 'Pós-tratamento',
    question: 'Após o tratamento, poderei praticar esportes normalmente?',
    answer:
      'Sim. Concluída a consolidação óssea e a reabilitação, o paciente retoma todas as atividades do dia a dia e esportes: correr, saltar, academia, bicicleta. O osso formado é tão resistente quanto o original.',
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
    category: 'De fora',
    question: 'Posso fazer o procedimento vindo de outra cidade ou estado?',
    answer:
      'Sim. Atendo pacientes de todo o Brasil. Uberlândia possui aeroporto com voos diários para diversas capitais, facilitando o deslocamento. Organizamos o calendário de avaliação, cirurgia e retornos para acomodar pacientes de outras cidades.',
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
      'Sim. A fisioterapia é parte fundamental do tratamento e começa no primeiro dia do pós-operatório. Ela garante manutenção de mobilidade, força muscular, prevenção de rigidez e reeducação da marcha ao longo de todo o processo.',
  },
  {
    id: 'q17',
    category: 'Contato',
    question: 'Como posso tirar outras dúvidas e agendar uma avaliação?',
    answer:
      'Você pode entrar em contato diretamente pelo WhatsApp através do botão fixo no site ou pelo Instagram @daviddemello.orto. A avaliação inicial pode ser presencial em Uberlândia-MG ou via teleconsulta para pacientes de outras cidades.',
  },
]
