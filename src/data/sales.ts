import { violinLaunch } from '../../shared/violin-launch'
import { guidedScoreCount } from '../../shared/guided-scores'
import { normalScoreCount, totalScoreCount, playbackCount } from '../../shared/score-catalog'
import { freeLibrary } from '../../shared/free-library'

export const salesFaqs = [
  [
    'Como funciona o acesso grátis?',
    `Informe seu e-mail na opção Grátis para receber seu link pessoal. A versão de teste libera ${freeLibrary.scoreCount} partituras com playback (${freeLibrary.scores.join(' e ')}) e ${freeLibrary.guidedScoreCount} guiadas em vídeo (${freeLibrary.guidedScores.join(' e ')}). Não inclui setlists prontos ou personalizados. Não pede pagamento nem cartão. Os demais materiais fazem parte dos planos pagos.`,
  ],
  [
    'O material é só para violino?',
    'Sim. Esta coleção é dedicada ao violino. A oferta atual não inclui bibliotecas de outros instrumentos.',
  ],
  [
    'Qual é a diferença entre os dois planos?',
    `O Básico inclui ${normalScoreCount} partituras e 10 setlists. O Completo reúne ${totalScoreCount} partituras no total: as ${normalScoreCount} partituras + ${guidedScoreCount} guiadas em vídeo, além de ${playbackCount} playbacks e 42 setlists. Os dois planos têm acesso vitalício, com compra única e sem assinatura.`,
  ],
  [
    'O que são as partituras guiadas?',
    `São vídeos em que você acompanha a partitura passando na tela enquanto a música toca. O Plano Completo inclui a coleção de ${guidedScoreCount} guiadas em uma aba própria; o Grátis libera ${freeLibrary.guidedScoreCount} delas para experimentar. Você pode pausar, voltar e ajustar a velocidade no player para estudar no seu ritmo.`,
  ],
  [
    'O acesso é vitalício nos dois planos?',
    'Sim. Os dois planos têm acesso vitalício aos materiais do pacote adquirido, com pagamento único e sem mensalidade. Guarde seu link pessoal para voltar à biblioteca.',
  ],
  [
    'Como funcionam os setlists?',
    'São 10 sequências no Básico e 42 no Completo, organizadas por ocasião, como casamentos, jantares, eventos e louvor. Na biblioteca, abra Setlists prontos, escolha a seleção e avance pelas partituras na ordem sugerida. Uma música pode fazer parte de mais de um setlist. A versão Grátis não tem setlists prontos nem personalizados.',
  ],
  [
    'Quais músicas estão incluídas?',
    `O acervo publicado tem ${normalScoreCount} partituras e ${guidedScoreCount} guiadas em vídeo, somando ${totalScoreCount} partituras no Completo. Explore o catálogo nesta página e confira títulos, artistas e estilos antes de comprar. Cada partitura é contada uma vez por música e artista; páginas extras e playbacks não aumentam o total. As versões guiadas são contadas separadamente, mesmo quando a música também tem partitura.`,
  ],
  [
    'Como funciona o valor de lançamento?',
    `O Plano Completo tem valor de lançamento de R$ 27,90 para pedidos iniciados até ${violinLaunch.deadlineLabel}, no horário de Brasília. A partir de ${violinLaunch.regularFromLabel}, novos pedidos custam R$ 49,90. O contador acompanha esse prazo fixo e não reinicia ao atualizar a página. Um pedido já iniciado mantém o total registrado e segue o prazo de pagamento do checkout.`,
  ],
  [
    'O que é um playback?',
    `É o acompanhamento que você reproduz enquanto toca a melodia no violino. O Completo inclui a coleção de playbacks; o Grátis libera ${freeLibrary.scoreCount} acompanhamentos para experimentar. O Básico não inclui playbacks.`,
  ],
  [
    'Como recebo meu acesso?',
    'A entrega é digital. No Grátis, basta informar seu e-mail para receber o link pessoal. Nos planos pagos, o acesso é liberado após a confirmação do pagamento pelo Mercado Pago. Guarde seu link para voltar à biblioteca.',
  ],
  [
    'Posso usar no celular ou tablet?',
    'Sim. A biblioteca pode ser acessada pelo computador, tablet ou celular. Para tocar junto de um playback, utilize a reprodução de áudio do seu dispositivo.',
  ],
]
