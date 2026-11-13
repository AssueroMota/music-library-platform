# Biblioteca grátis

Os botões “Testar de graça” no header, na primeira seção da página e abaixo dos dois planos pagos abrem um formulário próprio, sem checkout, cartão ou cobrança. A opção grátis não ocupa um cartão de preço. `POST /api/library/free` recebe somente um e-mail, normalizado e validado, com limite de três solicitações por minuto por IP. A resposta confirma a solicitação e não revela tokens, links pessoais ou a existência de uma conta paga.

A versão de teste é limitada por conteúdo, sem prazo de expiração:

- Partituras: A Thousand Years (Christina Perri) e Perfect (Ed Sheeran), com seus dois acompanhamentos.
- Guiadas: My Way (Frank Sinatra) e Bondade de Deus.
- Sem setlists prontos ou personalizados. A interface não oferece essas abas e GET/POST/PUT/DELETE dos setlists retornam 403 para contas exclusivamente gratuitas, inclusive rascunhos vazios.

A migração `202611130002_free_library_access` cria as tabelas privadas `library_free_access` e `library_free_samples` e o tipo de tarefa `FREE_ACCESS_EMAIL`. A lista de amostras aponta para seis arquivos privados existentes; nenhum arquivo é copiado para uma pasta pública. Novas músicas ou versões não são liberadas automaticamente.

O cadastro cria ou reutiliza a identidade Supabase, registra o acesso e o link pessoal criptografado e coloca o e-mail na fila. O e-mail usa Resend e o link pessoal já usado pela biblioteca. Falhas de entrega não removem o acesso; a fila repete com a mesma chave de idempotência. Cadastros simultâneos reutilizam a concessão e a tarefa. Após a primeira entrega, repetir o cadastro ou usar a recuperação em `/biblioteca` reenvia o link atual.

`GET /api/library` informa `freeAccess: true`, `accessMode: free` e `setlistLimit: 0` somente para acesso exclusivamente gratuito. A consulta de arquivos e as rotas de visualização e download verificam a concessão e a lista de amostras no servidor. A posse de um link ou ID de outro material não libera o arquivo.

Direitos pagos e prévias administrativas existentes têm precedência: cadastrar o mesmo e-mail na opção gratuita não reduz compras, altera preços ou modifica pedidos. Concessões gratuitas revogadas não são reativadas pelo formulário.

Verificação: testes de integração em PostgreSQL isolado cobrem cadastro, fila, falha e repetição de e-mail, concorrência, acesso pessoal, restrição de arquivos, ausência de compras, bloqueio de setlists, revogação e preservação de planos pagos. Os testes da interface cobrem o cartão, formulário, mensagens e as duas abas com duas músicas cada. Os provedores externos são substituídos nesses testes; não são enviados e-mails reais de teste.
