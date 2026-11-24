# Duelo da Velha — 3 vidas

Jogo local em HTML, CSS e JavaScript com arquitetura MVC. Abra `index.html` no navegador, sem instalação ou servidor.

## Integrantes

- **Breno Vargas Pereira** — RA: 823134327
- **Sabrina Amorim** — RA: 82329546
- **Natan Cardoso de Oliveira (Esculachado)** — RA: 823120309
- **Julia Freitas Santos** — RA: 823222304
- **Gabriel Baldini (Scaralhone)** — RA: 823115970
- **Giovanni Lourenço Paschoim** — RA: 824215509

## Regras do duelo e de negócio

- Modos: duas pessoas no mesmo dispositivo (PvP) ou jogador contra bot. Não há contas, multiplayer online, comunicação entre dispositivos nem persistência após recarregar a página.
- Cada participante começa com três vidas. Uma derrota desenha a cabeça; a segunda acrescenta o tronco e os dois braços; a terceira acrescenta as pernas e encerra o duelo.
- Empates não retiram vidas e somam ao contador de empates (`EMP`). O participante que começa alterna a cada rodada, inclusive após empates. No modo contra o bot, o bot joga com `O` e inicia as rodadas pares.
- **Próxima rodada** preserva vidas e placar e só fica disponível ao terminar a rodada (antes do fim do duelo).
- **Jogar revanche** reinicia o duelo após o resultado final (zerando vidas e placar e voltando para a rodada 1 com `X`). **Novo duelo** permite recomeçar mediante confirmação, mantendo nomes, modo e dificuldade.
- Trocar modo ou dificuldade reinicia o duelo diretamente. Alterar nomes não reinicia a partida.
- Nomes humanos aceitam até 24 caracteres (com fallback para `Jogador X` ou `Jogador O` quando vazios ou apenas com espaços) e o computador mantém `Bot` no modo contra bot.
- Bot fácil: aleatório; médio (padrão): 50% aleatório e 50% Minimax por jogada; difícil: Minimax.

## Requisitos Funcionais (RF)

- **RF01:** Exibir tabuleiro 3 por 3 e aceitar jogadas em casas vazias no turno correto.
- **RF02:** Detectar vitória nas oito combinações possíveis e empate sem combinação vencedora.
- **RF03:** Selecionar dois jogadores locais ou jogador contra bot, reiniciando o duelo ao trocar o modo.
- **RF04:** Oferecer Fácil, Médio e Difícil para o bot, reiniciando o duelo ao trocar a dificuldade.
- **RF05:** Permitir nomes humanos de até 24 caracteres e manter `Bot` como nome do computador.
- **RF06:** Exibir duas forcas, vidas individuais, rodada, placar e mensagens de turno e resultado.
- **RF07:** Liberar **Próxima rodada** após vitória ou empate, preservando vidas e placar.
- **RF08:** Encerrar o duelo na terceira derrota e oferecer **Jogar revanche**.
- **RF09:** Oferecer **Novo duelo** com confirmação e reinicializar vidas, placar, rodada e tabuleiro.
- **RF10:** Rejeitar casas ocupadas, índices inválidos e jogadas após o resultado, cancelando jogadas pendentes do bot ao reiniciar ou trocar configurações.

## Requisitos Não Funcionais (RNF)

- **RNF01 (Responsividade):** Layout fluido e responsivo sem quebra ou rolagem horizontal indesejada.
- **RNF02 (Compatibilidade):** HTML5, CSS3 e JavaScript puro compatíveis com navegadores modernos e hospedagem estática.
- **RNF03 (Desempenho e Controle de Turno):** Execução local ágil com agendamento do bot e cancelamento seguro de temporizadores pendentes.
- **RNF04 (Usabilidade):** Identificação visual clara de turnos, placar, vidas, forca e feedback de ações.
- **RNF05 (Acessibilidade):** Elementos semânticos, foco visível, navegação por teclado e anúncios de status via `role="status"` e `aria-live`.
- **RNF06 (Manutenibilidade e Testabilidade):** Separação clara entre `GameModel`, `GameView` e `GameController` e testes automatizados via `node --test`.
- **RNF07 (Segurança na Saída Textual e Execução Offline):** Uso de `textContent` para nomes e mensagens (sem `innerHTML` ou `eval`) e funcionamento local sem exigir backend ou CDN.

## Organização e validação

`GameModel` controla rodadas, vidas e resultado do duelo; `GameView` apresenta o estado; `GameController` coordena os eventos e cancela jogadas pendentes do bot ao reiniciar.

Execute `node --test tests/game.test.cjs` para verificar as regras e o ciclo de turnos.

---

## Documentação original da versão anterior

O conteúdo abaixo descreve a versão anterior, sem o sistema de vidas. O arquivo Documentacao_Tecnica_Jogo_da_Velha_MVC.docx contém a documentação atual e pode ser regenerado com gerar_documento.py (requer python-docx no ambiente de autoria).

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
git remote add origin [https://github.com/SEU_USUARIO/jogo-da-velha-mvc.git](https://github.com/SEU_USUARIO/jogo-da-velha-mvc.git)
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
