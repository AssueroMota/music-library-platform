# Oferta de violino

A página pública oferece dois planos com pagamento único:

| Produto                    | Preço                                                   | Permissão                                                                          |
| -------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `library-violin-scores`    | R$ 12,90                                                | Coleção de 100 partituras de violino, sem áudios, 10 setlists e acesso vitalício   |
| `library-violin-playbacks` | R$ 27,90 na promoção; R$ 49,90 a partir de 01/11/2026 | Coleção de 100 partituras de violino com playbacks, 42 setlists e acesso vitalício |

A coleção está em expansão. A contagem da biblioteca reflete apenas os arquivos publicados, sem inventar materiais para completar a oferta. A migração `202610270001_violin_lifetime_collection` atualiza somente as descrições dos planos; não altera preços, disponibilidade, pedidos ou permissões.

## Setlists por plano

O Básico mantém as 10 seleções originais. O Completo reúne essas 10 e 32 sequências adicionais, totalizando 42 setlists conferidos com o acervo. A biblioteca, os benefícios, o FAQ e a descrição do catálogo refletem essa diferença.

## Condição real de lançamento

O usuário autorizou criar uma condição de lançamento com mudança de preço e, em 28/10/2026, confirmou reabrir a oferta até 31/10 às 23h59 por R$ 27,90. Foi definida a seguinte regra para o Plano Completo:

- Início: 24/10/2026 às 00h00, horário de Brasília.
- Pedidos iniciados dentro da oferta reaberta, até 31/10/2026 às 23h59: R$ 27,90.
- Novos pedidos a partir de 01/11/2026 às 00h00: R$ 49,90.
- Diferença em relação ao próximo preço: R$ 22,00. Não se afirma que o preço de R$ 49,90 foi cobrado no passado.

`shared/violin-launch.ts` é a fonte da regra de preço. O endpoint `/api/products` e a criação do pedido aplicam a mesma regra no servidor, mesmo se o registro do produto ainda contiver um valor-base anterior. Esta condição é deliberadamente uma regra de preço do produto; editar apenas o preço-base no banco não substitui a campanha. Para alterar a campanha, atualize a regra e publique frontend e backend juntos.

O contador usa um prazo absoluto e não reinicia por visitante nem por atualização da página. A seção, o preço e o atalho móvel se atualizam automaticamente no término. O anúncio em `LaunchOfferCountdown` substitui o aviso genérico antigo; `violinLaunchCampaign` permanece desativado e não controla esta oferta.

O checkout envia o total que o comprador viu como `expectedPriceCents`. Se o preço mudar antes da criação do pedido, o servidor recusa com `PRODUCT_PRICE_CHANGED`, sem criar cobrança. A interface consulta o novo total e exige outro clique. Pedidos já iniciados preservam o valor registrado e continuam sujeitos à expiração existente de pagamento. As tentativas de compra do navegador são separadas por produto, e-mail e valor.

A página de vendas antecipa a consulta de catálogo ao abrir, permitindo que a API hospedada inicie enquanto o visitante conhece os planos. O checkout compartilha a consulta em andamento e reaproveita respostas por até 60 segundos, somente na memória da página. O cache expira também no início e no fim da promoção; falhas não são armazenadas. Trocar de plano ou fechar e reabrir o checkout reutiliza a mesma consulta. Fechar o diálogo remove seus avisos e atualizações, preservando a consulta compartilhada. A biblioteca e as páginas de retorno não iniciam esse prefetch.

A consulta de catálogo aguarda até 60 segundos. Após cinco segundos com o checkout aberto e ainda aguardando, a interface informa que está confirmando o preço. Ao esgotar o prazo, apresenta uma mensagem específica e oferece nova tentativa manual. Se o servidor recusar um valor desatualizado, o cliente descarta o cache, consulta o preço atual e exige outro clique. A criação de cobrança mantém o prazo padrão e nunca é repetida automaticamente. A consulta no navegador ao site publicado confirmou os dois produtos disponíveis, com R$ 12,90 e R$ 27,90 durante o lançamento; isso não constitui teste de compra real. A antecipação reduz a espera percebida, mas não elimina a suspensão por inatividade da hospedagem.

## Apresentação e compra

O Plano Completo recebe destaque visual com capa digital, partitura de exemplo, imagem de violinista, representação de playback e selo editorial de indicação. O plano não é apresentado como mais vendido ou acompanhado de avaliações inventadas. A comparação mostra somente os benefícios efetivamente incluídos. O CTA adicional e o atalho móvel levam ao Completo.

O backend aplica a permissão na listagem, visualização e download. O Básico não libera os playbacks. Os produtos antigos e seus acessos permanecem preservados, enquanto a migração `202610240005_violin_offers` retira as ofertas antigas da venda.

## Publicar no ambiente de destino

Publique frontend e backend da mesma revisão. `npm start` executa `npm run db:migrate` automaticamente pelo `prestart` antes de iniciar a API; uma falha de migração impede que a nova API aceite pedidos com o catálogo antigo. A migração usa somente alterações versionadas e preserva os registros de compras anteriores. Se a hospedagem executar o arquivo Node diretamente, configure `npm run db:migrate` como comando de pré-deploy. A implementação e o envio ao GitHub não executam diretamente comandos no banco de produção nem modificam arquivos `.env`.

O controle `CHECKOUT_ENABLED` continua determinando a disponibilidade das compras. Como o prazo é fixo, publicar depois de 31/10/2026 exibirá diretamente o preço de R$ 49,90. O prazo não será prorrogado automaticamente. Antes de abrir as vendas, finalize o acervo e as informações de suporte e termos.

## Conteúdo, demonstração e provas reais

A página usa preto, laranja e âmbar, com imagens de apresentações em celebrações, restaurantes e eventos. As fotos são ilustrativas das ocasiões e não são apresentadas como compradores.

`src/data/violin-sales.ts` configura o vídeo e os relatos autorizados. A lista vazia de depoimentos não exibe prova social fictícia. O usuário confirmou 25 anos de experiência musical; o bloco de autoridade foi posteriormente retirado da página a pedido dele, mantendo o dado arquivado.

A demonstração principal utiliza a partitura e o MP3 de A Thousand Years fornecidos pelo usuário. O MP3 contém somente acompanhamento, conforme confirmado por ele. Há um player e a imagem integral com opção de ampliar. A prévia de navegação foi atualizada para `PublicLibraryPreview`, reutilizando o layout de `MemberRepertoire` com busca, filtros, setlists e área de estudo. O catálogo público de `src/data/public-repertoire.ts` contém somente metadados (título, artista, estilo e existência de áudio), sem IDs privados, caminhos de storage ou URLs assinadas. É um retrato atualizado manualmente do catálogo publicado.

Na prévia, apenas A Thousand Years usa os arquivos públicos já existentes na página. Os demais materiais mostram uma mensagem de acesso pela área do aluno. `previewMedia` limita a demonstração a uma lista explícita de arquivos públicos e impede consultas ao endpoint privado; não altera a autenticação ou as permissões de compra da biblioteca. O componente é carregado ao abrir o exemplo, preservando o carregamento inicial da página de vendas.

A biblioteca diferencia o Básico (somente partituras e 10 setlists) do Completo (partituras, playbacks e 42 setlists). `/api/library` informa `setlistLimit` a partir dos direitos ativos; a listagem e os endpoints de arquivo continuam bloqueando áudio no Básico. A interface também suprime os controles de áudio desse plano. As 32 seleções adicionais de `setlists-complete.ts` usam músicas existentes, organizadas por ocasião; cada setlist resolve apenas materiais disponíveis na conta e preserva a identificação do artista em títulos ambíguos.

A prévia pública permite comparar os dois planos. A busca e o estilo são os únicos filtros; o repertório usa ordem alfabética e cada setlist mantém sua sequência sugerida. A interface segue o laranja da página de vendas, usa uma tabela mais legível e amplia a área útil até 1760 px no desktop. Foram removidos o nome do produto repetido, o selo de instrumento acima do repertório, os textos de introdução redundantes e os controles de ordenação e playback.

O ponto de entrada carrega a biblioteca e o retorno do checkout sem baixar o código de animação e os estilos da página de vendas. O link pessoal continua fixo: a API valida o segredo e os direitos ativos antes de reutilizar uma sessão da mesma pessoa. Sem sessão compatível, o navegador confirma o token temporário pelo SDK do Supabase e abre a biblioteca sem redirecionamento externo nem recarregar o site. A confirmação inteira é deduplicada em efeitos concorrentes. A geração do link existente usa somente uma leitura do banco; a criação concorrente e a rotação mantêm suas proteções anteriores.

Para o titular do Completo conferir a apresentação do Básico nos próprios dispositivos, `?visualizar=basico` restringe a tela a partituras e 10 setlists. Esse parâmetro só remove materiais da visualização; não concede direitos nem altera compras. O modo é preservado na confirmação do login e ao copiar o link pessoal. Sem o parâmetro, a conta volta a mostrar os materiais do plano adquirido.

## Upgrade dentro da biblioteca

O botão **Fazer upgrade** fica na biblioteca Básica, ao lado de **Copiar meu acesso**. O resumo autenticado calcula no servidor o preço atual do Completo menos o valor efetivamente pago em uma compra Básica aprovada e ainda ativa. Havendo mais de uma compra Básica, considera a de maior valor; não soma compras repetidas. Se o valor já pago cobrir o Completo, não cria cobrança e orienta o atendimento.

O cliente confirma a diferença antes de criar o pedido. O e-mail é o da conta autenticada e não pode ser substituído no navegador. O pedido de upgrade usa o produto Completo e registra a compra Básica que originou o crédito. Tentativas repetidas reutilizam o pedido e tentativas concorrentes são bloqueadas. Um pagamento iniciado conserva seu valor até a expiração existente; mudar o preço antes da criação exige nova confirmação.

O webhook e a liberação seguem a verificação de pagamento existente. Ao aprovar, o usuário recebe o direito do Completo no mesmo usuário e link pessoal, sem rotação. O estorno do upgrade mantém o Básico. Se a compra Básica usada no desconto for estornada, o direito dependente do upgrade também é suspenso. A migration `202610280002_library_upgrade` adiciona somente a referência entre pedidos; não altera preços nem compras anteriores.

Na prévia Básica do titular que já possui o Completo, o botão abre a opção **Abrir meu Completo**, sem nova cobrança. O retorno do pagamento leva ao link normal; também há **Já paguei · Atualizar meu acesso** e a atualização ao voltar à aba depois de iniciar um upgrade. Ações sem compra pendente não disparam recargas por foco.

## Validação

Os testes cobrem a virada de preço no fuso de Brasília, o término do contador sem recarregar, a atualização do catálogo público, o bloqueio de totais desatualizados, o novo clique exigido no checkout e o encaminhamento dos CTAs para o plano correto. A validação visual em navegador depende de uma sessão disponível.

## Cabeçalho e oferta compacta

O contador agora aparece em `LaunchOfferHeader`, em uma faixa aderente ao topo da página de vendas. Ele permanece visível durante a rolagem no computador e no celular e inclui um botão para abrir diretamente o checkout do Plano Completo. Ao expirar, a faixa some e os preços passam para o valor regular. A área da biblioteca e as páginas de retorno de pagamento não recebem essa faixa.

O banner grande da seção de planos e o atalho fixo inferior foram retirados. Os cartões usam uma apresentação visual menor, os benefícios do pacote, preço e botão. Foram retirados números decorativos, descrições repetidas, a caixa de economia e o CTA duplicado abaixo dos planos. Os cartões seguem a altura natural do conteúdo, sem esticar o Básico para igualar o Completo.

Os cards de setlists priorizam ocasião, título, amostra de músicas e quantidade. A descrição completa aparece ao abrir a seleção. A grade usa quatro colunas em telas largas, três ou duas em telas intermediárias e uma no celular. Os planos usam ilustrações menores e espaçamentos reduzidos, mantendo benefícios legíveis e botões com pelo menos 48 px de altura.

O preço de R$ 49,90 aparece riscado sobre o valor promocional de R$ 27,90, acompanhado da legenda curta `preço de 01/11`, mantendo claro que é o preço após o prazo. O prazo real e a proteção do checkout continuam em vigor.

## Música na página de vendas

A trilha tenta iniciar a 20% do volume ao entrar. Se o navegador recusar com `NotAllowedError`, uma interação de clique/toque ou Enter/Espaço na página tenta novamente. Essa espera não é reativada depois de uma pausa voluntária, falha de arquivo ou escolha de outra mídia. Os controles de áudio/vídeo e os campos de formulário não disparam essa retomada. A pausa escolhida continua válida na mesma sessão. Navegadores podem impedir áudio com som sem interação; não se promete contornar essa restrição.
