# Jogo da Velha — Arquitetura MVC e Engenharia de Software

Projeto acadêmico interativo desenvolvido para a disciplina de **Engenharia de Software**, abordando o levantamento formal de requisitos, regras de negócio, acessibilidade web (WCAG 2.1 AA) e implementação pura no padrão arquitetural **MVC (Model-View-Controller)**.

---

## 🚀 Como Executar no Computador da Faculdade

A aplicação foi construída **100% Baunilha (Vanilla HTML5, CSS3 e JavaScript ES2020)**, sem frameworks, dependências externas (`npm`) ou necessidade de conexão à internet:

1. Baixe ou copie a pasta do projeto (`jogo-da-velha-mvc`).
2. Dê um **duplo clique no arquivo `index.html`** para abrir diretamente no navegador padrão (Google Chrome, Microsoft Edge, Mozilla Firefox ou Safari).
3. A aplicação funcionará de forma imediata e offline (`file:///...`).

---

## 🌐 Como Fazer o Deploy no GitHub Pages (Para Enviar ao Professor)

Para publicar o projeto e gerar um link acessível para qualquer pessoa (incluindo seu professor):

### Passo 1: Criar o Repositório no GitHub
1. Acesse sua conta no [GitHub](https://github.com) e clique em **New Repository** (Novo Repositório).
2. Dê um nome ao repositório (ex.: `jogo-da-velha-mvc`) e deixe-o como **Public** (Público).
3. Clique em **Create repository**.

### Passo 2: Subir os Arquivos
No terminal da sua pasta local ou pelo próprio botão *"uploading an existing file"* do site do GitHub, envie os arquivos:
```bash
git init
git add .
git commit -m "feat: implementacao completa do Jogo da Velha MVC conforme especificacao"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/jogo-da-velha-mvc.git
git push -u origin main
```

### Passo 3: Ativar o GitHub Pages
1. No seu repositório no GitHub, clique na aba **Settings** (Configurações).
2. No menu lateral esquerdo, clique em **Pages**.
3. Na seção **Branch**, selecione `main` e a pasta `/ (root)`.
4. Clique em **Save**.
5. Aguarde cerca de 1 minuto: o GitHub fornecerá o link público oficial da aplicação, pronto para envio:
   `https://SEU_USUARIO.github.io/jogo-da-velha-mvc/`

---

## 🏗️ Estrutura Arquitetural MVC

O código foi rigorosamente desacoplado em 3 arquivos autônomos:

```text
jogo-da-velha-mvc/
├── index.html        # Estrutura semântica HTML5 e elementos acessíveis (dialog, buttons, status)
├── styles.css        # CSS Grid, Flexbox, variáveis modernas e contraste WCAG 2.1 AA
├── app.js            # Lógica desacoplada em GameModel, GameView e GameController
└── README.md         # Documentação técnica e instruções
```

### 1. `GameModel` (Modelo)
- Gerencia o estado do tabuleiro (array de 9 posições), turno ativo (`'X'` ou `'O'`), bloqueio pós-jogo e histórico de pontuação.
- Executa as regras de negócio puras (validação de sobreposição, avaliação das 8 combinações de vitória e critério de empate).
- **Desacoplamento**: 0% de dependência do DOM.

### 2. `GameView` (Visão)
- Manipula o DOM de forma segura (sem `innerHTML` ou `eval`).
- Gerencia a acessibilidade: foco por teclado, anúncios via `role="status"` e `aria-live="polite"`, e `aria-label` dinâmico em cada célula.
- Dispara feedback visual (animação de tremor) e auditivo sutil via Web Audio API em jogadas inválidas.
- Controla o diálogo nativo `<dialog>` de confirmação para exclusão de dados.

### 3. `GameController` (Controlador)
- Conecta a View e o Model.
- Escuta os eventos disparados pela interface, consulta o modelo e instrui a visão a renderizar as atualizações.

---

## 📋 Matriz de Conformidade com a Especificação

### Requisitos Funcionais (RF)
- [x] **RF01 (Exibir Tabuleiro 3x3)**: Grid de 9 células em 3x3 estruturado com botões semânticos.
- [x] **RF02 (Registrar Jogada Válida)**: Marca X ou O na célula vazia selecionada.
- [x] **RF03 (Alternar Jogadores)**: Alternância automática de turno após jogada bem-sucedida.
- [x] **RF04 (Impedir Casa Ocupada)**: Recusa clique em célula ocupada sem troca de turno.
- [x] **RF05 (Verificar Vitória e Empate)**: Avaliação síncrona das 8 combinações e detecção de empate.
- [x] **RF06 (Reiniciar Partida)**: Botão "Nova Partida" reinicia tabuleiro com X mantendo o placar.
- [x] **RF07 (Atualizar Placar)**: Contabilização em tempo real de Vitórias de X, Vitórias de O e Empates.
- [x] **RF08 (Zerar Placar com Confirmação)**: Diálogo modal exigindo confirmação explícita antes de resetar.

### Requisitos Não Funcionais (RNF)
- [x] **RNF01 (Responsividade)**: Totalmente fluido de 360px a 1440px+ sem scroll horizontal.
- [x] **RNF02 (Compatibilidade)**: Padrão ES2020 e CSS3 puro compatível com todos os navegadores modernos.
- [x] **RNF03 (Desempenho)**: Execução local com latência de clique < 50ms.
- [x] **RNF04 (Usabilidade)**: Diferenciação clara de cores e tipografia para X e O, banner de turno e foco visível.
- [x] **RNF05 (Acessibilidade)**: Contraste $\ge 4.5:1$ (WCAG AA), botões semânticos e navegação por teclado (`Tab`, `Enter`, `Espaço`).
- [x] **RNF06 (Manutenibilidade)**: Padrão MVC estrito com código limpo e autodocumentado.
- [x] **RNF07 (Offline)**: 100% autônomo, sem requisições de backend ou bibliotecas de CDN.

---

## 🧪 Roteiro de Testes Homologados (CT01 a CT10)

| Caso de Teste | Ação Realizada | Resultado Homologado |
|---|---|---|
| **CT01** | Vitória por Linha | 3 casas destacadas em verde e +1 no placar de X. |
| **CT02** | Vitória por Coluna | 3 casas destacadas em verde e +1 no placar de O. |
| **CT03** | Vitória por Diagonal | Trinca diagonal destacada e vitória atribuída ao jogador correto. |
| **CT04** | Empate ("Velha") | Status exibe *"Partida empatada!"* e +1 no placar de Empates. |
| **CT05** | Casa Já Ocupada | Jogada recusada, animação de tremor/som sutil e turno mantido. |
| **CT06** | Tentativa Pós-Fim | Células permanecem bloqueadas contra novos cliques. |
| **CT07** | Nova Partida | Tabuleiro limpo, Jogador X reinicia e placar mantido. |
| **CT08** | Zerar Placar | Exibe modal; ao confirmar, placares voltam para 0. |
| **CT09** | Navegação por Teclado | Foco visual nítido (`Tab`) e acionamento via `Enter` ou `Espaço`. |
| **CT10** | Telas 360px a 1440px | Layout responsivo sem quebras ou rolagem horizontal. |
