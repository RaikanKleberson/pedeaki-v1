# PedeAki — Catálogo Online com Pedido via WhatsApp

> Solução digital para pequenos e médios negócios que perdem tempo e dinheiro com pedidos físicos sem confirmação de preço.

---

## O problema que o PedeAki resolve

Em mercadinhos, mercearias, açougues, hamburguerias, pizzarias, autopeças e ferragistas, existe um gargalo silencioso:

1. O cliente monta o pedido ou escolhe os produtos
2. O funcionário separa tudo manualmente
3. O cliente descobre o valor total só no caixa
4. O cliente desiste — e o funcionário precisa repor tudo

Esse ciclo desperdiça tempo do colaborador, ocupa espaço e gera frustração dos dois lados.

**O PedeAki elimina esse gargalo.**

---

## Como funciona

O cliente acessa o catálogo online, seleciona os produtos com quantidade, visualiza o valor total em tempo real e finaliza o pedido diretamente pelo WhatsApp — com nome, endereço e lista completa já formatados.

O funcionário recebe o pedido pronto, separa apenas o que foi confirmado e aguarda o pagamento.

```
Cliente acessa o catálogo
        ↓
Seleciona produtos + quantidade
        ↓
Visualiza valor total
        ↓
Informa nome e endereço
        ↓
Finaliza → WhatsApp da empresa com pedido completo
        ↓
Funcionário separa e confirma entrega
```

---

## Funcionalidades atuais

- Catálogo de produtos organizado por categorias
- Controle de quantidade por item
- Cálculo de total em tempo real
- Checkout com nome e endereço do cliente
- Envio automático do pedido formatado para o WhatsApp do negócio
- Dados de produtos carregados via Supabase (banco de dados em nuvem)
- Keep Alive automático via GitHub Actions para manter o banco ativo

---

## Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Banco de dados | Supabase (PostgreSQL) |
| Hospedagem | GitHub Pages |
| Automação | GitHub Actions |
| Integração | WhatsApp API (wa.me) |

---

## Roadmap — próximas versões

O PedeAki é um produto em evolução contínua. As próximas versões incluem:

- [ ] Painel administrativo para o dono do negócio
- [ ] Histórico de pedidos por cliente
- [ ] Notificação de novo pedido em tempo real
- [ ] Integração com Pix e boleto
- [ ] Rastreio de entrega
- [ ] Integração com Google Maps
- [ ] Painel de relatórios e produtos mais vendidos
- [ ] Sistema multi-tenant (uma instância por cliente)

---

## Modelo comercial

O PedeAki é comercializado pela **NOKAIZ Tecnologia** no modelo de assinatura:

- **Implementação:** configuração inicial, cadastro de produtos e personalização
- **Mensalidade:** manutenção, suporte e acesso às atualizações

Voltado para pequenos e médios negócios locais que querem digitalizar o atendimento sem depender de aplicativos caros ou complexos.

---

## Demonstração

🔗 [Acessar demonstração ao vivo](https://raikankleberson.github.io/pedeaki-v1/)

> O catálogo de demonstração utiliza produtos fictícios. A implementação para cada cliente é personalizada com os produtos, preços, logo e WhatsApp do próprio negócio.

---

## Contato

Interessado em implementar o PedeAki no seu negócio?

📲 [Falar com a NOKAIZ Tecnologia pelo WhatsApp](https://wa.me/63999665779)

---

Desenvolvido por [Raikan Kleberson](https://github.com/RaikanKleberson) — [NOKAIZ Tecnologia](https://wa.me/63999665779)
