# Oferta de violino

A página pública oferece dois planos com pagamento único:

| Produto                    | Preço                                                   | Permissão                                              |
| -------------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| `library-violin-scores`    | R$ 12,90                                                | 25 partituras de violino, sem áudios                   |
| `library-violin-playbacks` | R$ 27,90 no lançamento; R$ 49,90 a partir de 28/10/2026 | 100 partituras de violino com os respectivos playbacks |

## Condição real de lançamento

O usuário autorizou criar uma condição de lançamento com mudança de preço. Foi definida a seguinte regra para o Plano Completo:

- Início: 24/10/2026 às 00h00, horário de Brasília.
- Pedidos iniciados até 27/10/2026 às 23h59: R$ 27,90.
- Novos pedidos a partir de 28/10/2026 às 00h00: R$ 49,90.
- Diferença em relação ao próximo preço: R$ 22,00. Não se afirma que o preço de R$ 49,90 foi cobrado no passado.

`shared/violin-launch.ts` é a fonte da regra de preço. O endpoint `/api/products` e a criação do pedido aplicam a mesma regra no servidor, mesmo se o registro do produto ainda contiver um valor-base anterior. Esta condição é deliberadamente uma regra de preço do produto; editar apenas o preço-base no banco não substitui a campanha. Para alterar a campanha, atualize a regra e publique frontend e backend juntos.

O contador usa um prazo absoluto e não reinicia por visitante nem por atualização da página. A seção, o preço e o atalho móvel se atualizam automaticamente no término. O anúncio em `LaunchOfferCountdown` substitui o aviso genérico antigo; `violinLaunchCampaign` permanece desativado e não controla esta oferta.

O checkout envia o total que o comprador viu como `expectedPriceCents`. Se o preço mudar antes da criação do pedido, o servidor recusa com `PRODUCT_PRICE_CHANGED`, sem criar cobrança. A interface consulta o novo total e exige outro clique. Pedidos já iniciados preservam o valor registrado e continuam sujeitos à expiração existente de pagamento. As tentativas de compra do navegador são separadas por produto, e-mail e valor.

## Apresentação e compra

O Plano Completo recebe destaque visual com capa digital, partitura de exemplo, imagem de violinista, representação de playback e selo editorial de indicação. O plano não é apresentado como mais vendido ou acompanhado de avaliações inventadas. A comparação mostra somente os benefícios efetivamente incluídos. O CTA adicional e o atalho móvel levam ao Completo.

O backend aplica a permissão na listagem, visualização e download. O Básico não libera os playbacks. Os produtos antigos e seus acessos permanecem preservados, enquanto a migração `202610240005_violin_offers` retira as ofertas antigas da venda.

## Publicar no ambiente de destino

Publique frontend e backend da mesma revisão. `npm start` executa `npm run db:migrate` automaticamente pelo `prestart` antes de iniciar a API; uma falha de migração impede que a nova API aceite pedidos com o catálogo antigo. A migração usa somente alterações versionadas e preserva os registros de compras anteriores. Se a hospedagem executar o arquivo Node diretamente, configure `npm run db:migrate` como comando de pré-deploy. A implementação e o envio ao GitHub não executam diretamente comandos no banco de produção nem modificam arquivos `.env`.

O controle `CHECKOUT_ENABLED` continua determinando a disponibilidade das compras. Como o prazo é fixo, publicar depois de 27/10/2026 exibirá diretamente o preço de R$ 49,90. O prazo não será prorrogado automaticamente. Antes de abrir as vendas, finalize o acervo e as informações de suporte e termos.

## Conteúdo, demonstração e provas reais

A página usa preto, laranja e âmbar, com imagens de apresentações em celebrações, restaurantes e eventos. As fotos são ilustrativas das ocasiões e não são apresentadas como compradores.

`src/data/violin-sales.ts` configura o vídeo e os relatos autorizados. A lista vazia de depoimentos não exibe prova social fictícia. O usuário confirmou 25 anos de experiência musical; o bloco de autoridade foi posteriormente retirado da página a pedido dele, mantendo o dado arquivado.

A demonstração principal utiliza a partitura e o MP3 de A Thousand Years fornecidos pelo usuário. O MP3 contém somente acompanhamento, conforme confirmado por ele. Há um player e a imagem integral com opção de ampliar. A prévia de navegação da biblioteca mantém os estudos originais de exemplo.

## Validação

Os testes cobrem a virada de preço no fuso de Brasília, o término do contador sem recarregar, a atualização do catálogo público, o bloqueio de totais desatualizados, o novo clique exigido no checkout e o encaminhamento dos CTAs para o plano correto. A validação visual em navegador depende de uma sessão disponível.

## Cabeçalho e oferta compacta

O contador agora aparece em `LaunchOfferHeader`, em uma faixa aderente ao topo da página de vendas. Ele permanece visível durante a rolagem no computador e no celular e inclui um botão para abrir diretamente o checkout do Plano Completo. Ao expirar, a faixa some e os preços passam para o valor regular. A área da biblioteca e as páginas de retorno de pagamento não recebem essa faixa.

O banner grande da seção de planos e o atalho fixo inferior foram retirados. Os cartões usam uma apresentação visual menor, três benefícios essenciais, preço e botão. Foram retirados números decorativos, descrições repetidas, a caixa de economia e o CTA duplicado abaixo dos planos. Os cartões seguem a altura natural do conteúdo, sem esticar o Básico para igualar o Completo.

O preço de R$ 49,90 aparece riscado sobre o valor de lançamento de R$ 27,90, acompanhado da legenda curta `preço de 28/10`, mantendo claro que é o preço futuro. O prazo real e a proteção do checkout continuam em vigor.
