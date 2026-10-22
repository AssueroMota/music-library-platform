# Próxima fase

Esta entrega é uma landing page pública. Não contém backend, banco de dados, autenticação, checkout, integração de pagamentos ou biblioteca privada.

## Pontos de integração

| Área          | Ponto atual                                         | Trabalho futuro                                                                      |
| ------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Catálogo      | `src/data/content.ts`, tipos `Instrument` e `Track` | Serviço de catálogo, paginação, arquivos autorizados, arranjos reais por instrumento |
| Players       | `AudioPlayer` recebe `src` e `label`                | URLs assinadas de áudio, metadados e tratamento de autorização                       |
| Partituras    | `Score` ilustra dois estudos em SVG                 | Visualizador de PDF, downloads e controle de acesso                                  |
| Planos        | `Plan` com preço e URL opcionais                    | Definir preços, duração do acesso e condições; preencher `checkoutUrl`               |
| Checkout      | Botões sem URL abrem aviso informativo              | Provedor de Pix/cartão e checkout hospedado                                          |
| Liberação     | Somente descrição do fluxo planejado                | Webhooks verificados, operações idempotentes e permissões após confirmação           |
| Conta         | Inexistente                                         | Autenticação, recuperação de acesso e biblioteca privada                             |
| Favoritos     | Estado React em memória                             | Persistência por conta, setlists e organização pessoal                               |
| Administração | Inexistente                                         | Upload de partituras/áudios, curadoria, pacotes e permissões                         |
| Comunicação   | Canal de contato não configurado                    | E-mail oficial, confirmação de compra e suporte                                      |
| Documentos    | Avisos de versão demonstrativa                      | Termos, privacidade e licenças revisados para a operação real                        |

## Limites importantes

- Nenhuma chave privada deve entrar em variáveis `VITE_*`; esses valores são públicos no frontend.
- O frontend nunca deve ser a autoridade para liberar uma compra.
- Os materiais comerciais precisam de permissões de distribuição e execução adequadas.
- A biblioteca por instrumento, os pacotes e o acesso completo são possibilidades editoriais; os prazos de acesso ainda não foram definidos.
- Transposição, assinatura, setlists e permissões continuam fora do escopo desta versão.

## Publicação

O build produz arquivos estáticos em `dist/`. A configuração usa caminhos a partir da raiz do domínio. Para hospedagem em subpasta, ajustar `base` do Vite e as URLs dos arquivos públicos antes da publicação. Não há workflow de deploy nem dependência de um provedor de hospedagem nesta entrega.

Na raiz do domínio publicado, configurar `VITE_PUBLIC_SITE_URL` com a origem real para gerar canonical, `og:url` e imagem Open Graph absoluta. Não foi inserido um domínio fictício. Validar a página em navegador real nas larguras 320, 390, 768, 1024 e 1440 pixels antes do lançamento público.
