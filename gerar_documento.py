# -*- coding: utf-8 -*-
"""Atualiza o Word técnico do projeto. Dependência de autoria: python-docx."""
from pathlib import Path
from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT


def build_document(output_path):
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Cm(21), Cm(29.7)
    sec.top_margin = sec.bottom_margin = Cm(1.8)
    sec.left_margin = sec.right_margin = Cm(2)
    for name, size in [('Normal', 10), ('Title', 23), ('Subtitle', 12), ('Heading 1', 16), ('Heading 2', 11)]:
        style = doc.styles[name]
        style.font.name = 'Arial'
        style.font.size = Pt(size)
        style.font.color.rgb = RGBColor(0, 0, 0)
        for border in list(style._element.iter(qn('w:pBdr'))):
            border.getparent().remove(border)
        for fonts in style._element.iter(qn('w:rFonts')):
            for key in list(fonts.attrib):
                if 'Theme' in key or 'theme' in key:
                    del fonts.attrib[key]
    fmt = doc.styles['Normal'].paragraph_format
    fmt.line_spacing = 1.08
    fmt.space_after = Pt(6)
    for name in ['Heading 1', 'Heading 2']:
        doc.styles[name].paragraph_format.space_before = Pt(10)
        doc.styles[name].paragraph_format.space_after = Pt(6)
    doc.core_properties.title = 'Documentação técnica do Duelo da Velha'
    doc.core_properties.subject = 'Jogo local com três vidas e arquitetura MVC'

    def p(text):
        doc.add_paragraph(text)

    def h(text, level=2):
        doc.add_heading(text, level)

    def page(title):
        doc.add_page_break()
        h(title, 1)

    def table(headers, rows, widths):
        widths = [width * 0.94 for width in widths]
        t = doc.add_table(rows=1, cols=len(headers))
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        t.autofit = False
        for column, width in zip(t.columns, widths):
            column.width = Cm(width)
        for cell, text in zip(t.rows[0].cells, headers):
            cell.text = text
            for run in cell.paragraphs[0].runs:
                run.bold = True
        t.rows[0]._tr.get_or_add_trPr().append(OxmlElement('w:tblHeader'))
        for row in rows:
            for cell, text in zip(t.add_row().cells, row):
                cell.text = text
        for i, row in enumerate(t.rows):
            row._tr.get_or_add_trPr().append(OxmlElement('w:cantSplit'))
            for j, cell in enumerate(row.cells):
                cell.width = Cm(widths[j])
                cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
                tcpr = cell._tc.get_or_add_tcPr()
                shd = OxmlElement('w:shd')
                shd.set(qn('w:fill'), 'E8EEF5' if i == 0 else 'FFFFFF')
                tcpr.append(shd)
                borders = OxmlElement('w:tcBorders')
                for edge in ['top', 'left', 'bottom', 'right']:
                    el = OxmlElement('w:' + edge)
                    for key, value in [('val', 'single'), ('sz', '4'), ('color', 'D9D9D9')]:
                        el.set(qn('w:' + key), value)
                    borders.append(el)
                tcpr.append(borders)
                mar = OxmlElement('w:tcMar')
                for edge in ['top', 'left', 'bottom', 'right']:
                    el = OxmlElement('w:' + edge)
                    el.set(qn('w:w'), '90')
                    el.set(qn('w:type'), 'dxa')
                    mar.append(el)
                tcpr.append(mar)
                for para in cell.paragraphs:
                    para.paragraph_format.space_after = Pt(2)
                    para.paragraph_format.space_before = Pt(2)
                    for run in para.runs:
                        run.font.size = Pt(9)
        doc.add_paragraph().paragraph_format.space_after = Pt(0)

    doc.add_paragraph('Documentação técnica do Duelo da Velha', 'Title')
    doc.add_paragraph('Jogo local com três vidas e arquitetura MVC', 'Subtitle')
    p('Atualização de 8 de novembro de 2026')
    p('Este documento descreve as regras, a organização do código e a execução da versão atual. Cada partida de jogo da velha é uma rodada de um duelo maior. As derrotas desenham um personagem de forca; quem perde as três vidas perde o duelo.')
    h('1 Escopo e regras do duelo', 1)
    p('Há dois modos locais: duas pessoas no mesmo dispositivo ou uma pessoa contra o bot. Não há multiplayer online, contas de jogadores, comunicação entre dispositivos nem adivinhação de palavras. A forca representa as vidas perdidas.')
    p('Cada participante mantém seu símbolo durante o duelo. X inicia a primeira rodada. Depois, quem começa alterna, inclusive após empates. No modo contra o computador, o bot joga com O e inicia as rodadas pares.')
    table(['Derrotas', 'Desenho acrescentado', 'Vidas restantes'], [
        ['0', 'Apenas a estrutura da forca', '3'], ['1', 'Cabeça', '2'],
        ['2', 'Tronco e os dois braços', '1'], ['3', 'As duas pernas', '0 e fim do duelo'],
    ], [2.2, 10.1, 4.7])
    p('Uma vitória no tabuleiro soma um ponto ao vencedor e retira uma vida do adversário. Um empate soma ao contador de empates, sem retirar vidas. Depois do resultado, as casas ficam bloqueadas. Cliques adicionais não descontam novas vidas.')
    h('Diferença entre rodada e duelo')
    p('Rodada é uma disputa no tabuleiro de nove casas. Duelo é a sequência de rodadas que compartilham vidas e placar. O placar conta vitórias de rodadas e empates do duelo atual, sem histórico de duelos vencidos.')

    page('2 Requisitos e controles')
    table(['ID', 'Requisito funcional atual'], [
        ['RF01', 'Exibir tabuleiro 3 por 3 e aceitar jogadas em casas vazias no turno correto.'],
        ['RF02', 'Detectar vitória nas oito combinações possíveis e empate sem combinação vencedora.'],
        ['RF03', 'Selecionar dois jogadores locais ou jogador contra bot. Trocar o modo reinicia o duelo.'],
        ['RF04', 'Oferecer Fácil, Médio e Difícil para o bot. Trocar a dificuldade reinicia o duelo.'],
        ['RF05', 'Permitir nomes humanos de até 24 caracteres e manter Bot como nome do computador.'],
        ['RF06', 'Exibir duas forcas, vidas individuais, rodada, placar e mensagens de turno e resultado.'],
        ['RF07', 'Liberar Próxima rodada após vitória ou empate, preservando vidas e placar.'],
        ['RF08', 'Encerrar o duelo na terceira derrota e oferecer Jogar revanche.'],
        ['RF09', 'Oferecer Novo duelo com confirmação e reinicializar vidas, placar, rodada e tabuleiro.'],
        ['RF10', 'Rejeitar casas ocupadas, índices inválidos e jogadas após o resultado.'],
    ], [1.8, 15.2])
    h('Reinicializações')
    p('Próxima rodada fica desabilitado durante a rodada. Depois do resultado, limpa o tabuleiro e alterna o participante inicial. Se for a vez inicial do bot, a jogada é agendada automaticamente.')
    p('Jogar revanche aparece ao fim do duelo. Reinicia vidas e placar e retorna à rodada 1 com X. Novo duelo abre um diálogo: Cancelar preserva o estado; confirmar inicia outro duelo. Nomes, modo e dificuldade são mantidos nessas reinicializações.')
    p('Trocar o modo ou a dificuldade reinicia diretamente o duelo, conforme aviso da interface, sem usar o diálogo. Alterar nomes não reinicia a partida.')
    h('Dados e apresentação')
    p('O estado fica na memória da página. Recarregar restaura nomes padrão, três vidas, modo contra bot e dificuldade média. Foram removidos os três selos acadêmicos do cabeçalho e o quadro pedagógico do rodapé. O título e as instruções do jogo permanecem.')

    page('3 Arquitetura e estado')
    p('O jogo usa HTML, CSS e JavaScript sem frameworks ou etapa de build. As classes MVC ficam em app.js. O evento DOMContentLoaded cria modelo, visão e controlador; window.gameApp expõe o controlador para inspeção.')
    table(['Camada', 'Responsabilidade'], [
        ['GameModel', 'Mantém estado, valida jogadas, aplica as regras de rodada e duelo e calcula a jogada do bot. Não manipula o DOM.'],
        ['GameView', 'Apresenta tabuleiro, forcas SVG, nomes, vidas e resultados; liga eventos da interface e controla o diálogo e o feedback de casa ocupada.'],
        ['GameController', 'Recebe ações, chama o modelo, atualiza a visão e agenda ou cancela a jogada do bot.'],
    ], [3.2, 13.8])
    h('Estado da rodada')
    p('board contém nove posições com null, X ou O. currentPlayer identifica o turno; isGameOver bloqueia a rodada concluída; winner contém X, O, draw ou null; winningCombo registra os índices vencedores. checkWin verifica as oito trincas de WINNING_COMBINATIONS.')
    h('Estado do duelo')
    p('lives inicia com X: 3 e O: 3; round com 1; startingPlayer com X; duelWinner com null. scores guarda X, O e draws. gameMode aceita bot ou pvp, botPlayer é O, botDifficulty inicia em medium e playerNames guarda os nomes humanos separados dos símbolos.')
    h('Transições principais')
    p('makeMove valida a jogada e verifica primeiro vitória, depois empate. Na vitória, aumenta o placar, desconta uma vida de quem perdeu e define duelWinner se as vidas chegaram a zero. Sem resultado, alterna o turno.')
    p('nextRound recusa o avanço antes do resultado ou depois do fim do duelo. Caso permitido, incrementa round, alterna startingPlayer e limpa o tabuleiro por resetBoard. resetDuel restaura vidas, rodada e placar sem alterar nomes, modo ou dificuldade.')
    p('getPlayerName resolve o nome exibido; setPlayerName valida o símbolo, remove espaços nas extremidades e limita o texto. renderDuel atualiza os cartões, o placar e os estágios SVG conforme as vidas.')

    page('4 Bot nomes e interface')
    table(['Opção', 'Valor interno', 'Escolha da jogada'], [
        ['Fácil', 'easy', 'Escolhe aleatoriamente uma casa vazia.'],
        ['Médio', 'medium', 'A cada turno, 50% de chance de jogar aleatoriamente e 50% de usar Minimax. É o padrão inicial.'],
        ['Difícil', 'hard', 'Usa Minimax para escolher a melhor jogada.'],
    ], [2.5, 3, 11.5])
    p('Minimax simula os dois participantes até vitória, derrota ou empate. A pontuação é 10 menos a profundidade para vitória do bot, profundidade menos 10 para derrota e zero para empate. O nível difícil procura evitar derrotas. Empates sucessivos podem prolongar indefinidamente o duelo.')
    p('O controlador agenda o bot com atraso de aproximadamente 400 ms e ignora cliques humanos durante esse turno. cancelBotTurn usa clearTimeout antes de reiniciar ou trocar configurações. A ação agendada também verifica modo, turno e encerramento antes de jogar.')
    h('Nomes dos participantes')
    p('Contra o bot, apenas o nome de X é editável e o computador mantém Bot. Entre pessoas, X e O têm campos próprios. Os nomes aceitam até 24 caracteres; se vazios ou só com espaços, usam Jogador X ou Jogador O.')
    p('A digitação atualiza cartões, placar e mensagens, inclusive após um resultado. Não altera vidas nem reagenda o bot. O nome humano de O é preservado entre modos, mas fica oculto quando O representa o computador. Não há validação para nomes iguais.')
    h('Forca e saída textual')
    p('Os grupos SVG usam data-stage de 1 a 3. A visibilidade depende de 3 menos as vidas restantes. O SVG é decorativo para leitores de tela; o texto de vidas comunica o estado usando aria-live. Os cartões também identificam X ou O.')
    p('Nomes e mensagens são inseridos por textContent, sem interpretar o texto digitado como HTML. Não há eval ou innerHTML no código. Essa proteção da saída textual não é uma garantia geral de ausência de vulnerabilidades.')
    h('Acessibilidade implementada')
    p('As casas são botões nativos com foco visível, rótulos de linha e coluna e acionamento por teclado. O status usa role="status" e aria-live="polite". CSS Grid e Flexbox adaptam o layout. Esses recursos não equivalem a uma certificação WCAG 2.1 AA, que exige auditoria específica.')

    page('5 Execução e validação')
    table(['Arquivo', 'Função'], [
        ['index.html', 'Estrutura da tela, controles, diálogo e SVGs.'],
        ['styles.css', 'Layout responsivo, cores, foco e estados visuais.'],
        ['app.js', 'Modelo, visão, controlador e inicialização.'],
        ['tests/game.test.cjs', 'Quatro testes automatizados executados com Node.js.'],
        ['gerar_documento.py', 'Gera este Word; requer python-docx somente para autoria.'],
        ['README.md', 'Regras e execução, com a documentação antiga identificada como histórica.'],
    ], [5.4, 11.6])
    h('Como executar')
    p('Abra index.html diretamente no navegador. Para usar um servidor local, execute python -m http.server 8080 --bind 127.0.0.1 na pasta do projeto e acesse http://127.0.0.1:8080. Esse comando atende apenas a máquina local. Após alterações, atualize com Ctrl + F5.')
    p('O jogo também é compatível com hospedagem estática, sem adicionar multiplayer online. Não exige Node.js nem Python para jogar. Essas ferramentas servem aos testes, à geração do documento e ao servidor local opcional.')
    h('Verificações executadas nesta evolução')
    table(['Verificação', 'Cobertura observada'], [
        ['Testes automatizados', 'node --test tests/game.test.cjs: três derrotas e bloqueio; empate e alternância; vitória de O e índices inválidos; jogadas legais nas dificuldades e vitória imediata com Minimax.'],
        ['Fluxos no navegador', 'Estágios do desenho, PvP local, bot, cancelamento pendente, início pelo bot, dificuldade, confirmação de reinício e revanche.'],
        ['Nomes e interface', 'Nomes nos cartões e resultados, Bot fixo, preservação de O entre modos, nome vazio e texto semelhante a HTML. Remoção dos selos e rodapé com as nove casas preservadas.'],
        ['Layout', 'Inspeção da interface e verificação de ausência de rolagem horizontal na largura de 375 px durante a evolução do duelo.'],
    ], [4.6, 12.4])
    p('Os quatro testes automatizados passaram na implementação. As verificações de navegador foram complementares e não compõem uma suíte versionada. Não foram medidos tempos máximos de resposta nem realizada auditoria completa de acessibilidade ou de todos os navegadores.')

    page('6 Guia de apresentação e manutenção')
    h('Por que manter MVC')
    p('A separação permite testar as regras sem abrir a interface. GameModel recebe ações e retorna dados; GameView apresenta o estado e fornece eventos; GameController coordena o fluxo. A evolução para vidas e múltiplas rodadas reaproveitou o tabuleiro e o Minimax.')
    h('Como evitar o desconto duplicado de vidas')
    p('O resultado é aplicado na jogada vencedora. isGameOver passa a true e impede novas jogadas no modelo; a visão desabilita as casas. Assim, cliques posteriores não descontam outra vida.')
    h('Como distinguir os vencedores')
    p('winner identifica o resultado do tabuleiro; duelWinner só recebe um símbolo quando o adversário chega a zero vidas. O controlador prioriza a mensagem de vencedor do duelo e muda o botão para Jogar revanche.')
    h('Por que cancelar o temporizador')
    p('O atraso do bot é assíncrono. Uma ação programada antes de um reinício poderia marcar uma casa no estado seguinte. O cancelamento elimina essa ação pendente e a verificação de modo e turno reforça o controle.')
    h('O que significa dificuldade média')
    p('A escolha entre aleatoriedade e Minimax ocorre em cada jogada. Isso não garante metade das partidas ganhas e não representa uma estratégia intermediária fixa. O resultado depende do sorteio e das jogadas humanas.')
    h('Como regenerar o documento')
    p('No ambiente de autoria com python-docx, execute python gerar_documento.py. O script sobrescreve Documentacao_Tecnica_Jogo_da_Velha_MVC.docx na pasta do repositório. Revise o conteúdo e as páginas renderizadas antes de publicar novas versões.')
    h('Limites e referência de implementação')
    p('A sessão não persiste após recarregar. Os nomes podem ser iguais e mudar durante a rodada. Não há cadastro, autenticação ou limite de empates consecutivos. Mudanças futuras em vidas, transições, bot ou interface devem atualizar este documento e seu gerador.')
    p('Referência: natancardosoo/jogo-da-velha-mvc, arquivos app.js, index.html, styles.css e tests/game.test.cjs. Esta revisão incorpora três vidas, nomes humanos, dificuldades simplificadas e remoção dos elementos pedagógicos da tela.')
    doc.save(output_path)


if __name__ == '__main__':
    target = Path(__file__).resolve().parent / 'Documentacao_Tecnica_Jogo_da_Velha_MVC.docx'
    build_document(target)
    print(target)
