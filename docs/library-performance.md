# Desempenho da biblioteca

Diagnóstico em 05/11/2026: o Render confirmou a atualização do plano, mas a API publicada ainda levou 1,9–2,8 s para listar a biblioteca e 1,8–2,6 s para autorizar um vídeo. A reprodução completa no navegador não foi medida novamente.

## Causa identificada e alteração

As consultas com relações do Prisma geravam várias viagens entre API e banco. O catálogo fazia 5 consultas, a autorização de arquivo fazia 3, e a validação do link pessoal fazia 4. O link pessoal também era consultado novamente durante a listagem, embora pudesse ser carregado junto com as permissões.

`server/library-queries.ts` reúne essas leituras em SQL parametrizado, com joins e verificações `EXISTS`. Cada um desses passos usa uma consulta. O primeiro acesso de uma conta sem link pessoal ainda precisa criar o link. Não há alteração de esquema ou migração adicional.

As regras continuam verificadas no banco a cada pedido: identidade autenticada, pedido aprovado, acesso não revogado, instrumento, tipo de material e validade dos acessos de teste. A listagem remove os campos internos antes da resposta. A autenticação continua consultando o Supabase; não há cache de identidade ou permissão. As durações dos links assinados permanecem as mesmas.

## Medição controlada

API executada localmente, com o mesmo banco e provedores de produção, sem iniciar o worker. Tempos de handler medidos com `app.inject`, sem carregamento da página ou transferência do vídeo. Medianas de 3 pedidos para catálogo e autorização; uma medição para acesso por link. Estas amostras são indicativas e não constituem teste de carga.

| Etapa                              | Consultas antes → depois | Antes    | Depois |
| ---------------------------------- | ------------------------ | -------- | ------ |
| Listar biblioteca                  | 5 → 1                    | 509 ms   | 230 ms |
| Autorizar vídeo                    | 3 → 1                    | 365 ms   | 312 ms |
| Entrar pelo link pessoal           | 4 → 1                    | 1.111 ms | 385 ms |
| Reutilizar sessão com link pessoal | 4 → 1                    | 299 ms   | 141 ms |

No teste anterior à alteração, cada viagem ao banco levou aproximadamente 49–213 ms, e a autenticação levou 73–98 ms. O painel confirmou a API em **Oregon (US West)**, enquanto o endpoint do banco usa o pooler `sa-east-1` (São Paulo). Essa separação é um fator de latência, mas ainda é necessário medir cada etapa em produção para quantificar sua contribuição. A região e o plano não foram alterados nesta correção.

## Reabertura de arquivos e vídeos

As URLs de visualização são reutilizadas por até 120 segundos, com limite de 256 entradas em memória. A chave combina conta e caminho do arquivo. Autenticação e permissão no banco são verificadas antes de toda consulta ao cache. O cache não inclui links pessoais nem permissões e não é compartilhado entre contas. Falhas de assinatura não são guardadas. O prazo de assinatura do provedor continua em 600 segundos e downloads continuam recebendo links novos de 60 segundos.

A recuperação automática ou manual usa `/view?refresh=1` para obter uma nova assinatura mesmo quando há uma entrada no cache. Pedidos simultâneos da mesma conta e arquivo compartilham a assinatura em andamento. A reutilização da URL também permite aproveitar o cache do navegador e, quando disponível no projeto, o [Smart CDN do Supabase](https://supabase.com/docs/guides/storage/cdn/smart-cdn).

Os arquivos originais de Autumn Leaves e My Way tinham o índice MP4 no final. Foram preparadas versões com `faststart`, sem recompressão. Os hashes do conteúdo codificado de áudio e vídeo são idênticos aos originais; resolução, codecs e duração foram conferidos, e ambos passaram por decodificação completa. A publicação usa novos caminhos no bucket privado, preserva os IDs do catálogo e mantém os objetos originais para recuperação.

## Conferência após publicação

As rotas `/api/auth/access`, `/api/library` e `/api/library/assets/:id/view` ou `/download` devolvem o cabeçalho `Server-Timing`. Ele separa `auth` (Supabase), `database`, `login` (criação de link de autenticação) e `storage` (assinatura de URL), conforme a rota. Os valores são durações em milissegundos; não incluem SQL, credenciais ou dados de clientes.

Após o deploy do backend, repetir as medições em produção e observar esse cabeçalho para identificar a etapa dominante. Se `database` continuar alto, conferir a região do Render em relação a São Paulo. Alterar região exige planejamento próprio; não faz parte desta correção. Não é necessário aumentar o plano novamente para publicar esta alteração.

O SQL usa os tagged templates de `$queryRaw` e `Prisma.sql`, que mantêm os valores parametrizados conforme a [documentação do Prisma](https://www.prisma.io/docs/orm/v7/prisma-client/using-raw-sql/raw-queries). O projeto continua na versão 6 instalada, sem atualização de dependências.

## Validação da alteração

Os 66 testes do backend e 125 testes do frontend passaram. O backend usa PostgreSQL temporário isolado e cobre separação entre contas, limites de plano, link pessoal fixo, expiração de acesso de teste e bloqueio após estorno, inclusive com URL em cache. Os testes adicionais conferem prazo, isolamento, limite de memória e renovação do cache. O frontend confirma a renovação forçada durante recuperação. Typecheck e build completo passaram.

O deploy deve ser confirmado pela revisão no painel e pelo cabeçalho `Server-Timing` em produção. O envio ao GitHub sozinho não confirma o término do deploy. As medições controladas acima não equivalem a tempos de carregamento da página ou início da reprodução no navegador.
