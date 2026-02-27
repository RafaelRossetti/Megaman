# Megaman - Phaser 3

Este é um clone técnico de Megaman desenvolvido com Phaser 3.

## 🚀 Como Rodar o Projeto

1. Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
2. Abra um terminal na pasta do projeto.
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Abra o link gerado no seu navegador.

## 🎮 Controles

| Ação | Tecla |
|------|-------|
| Mover | Setas (Esq/Dir) |
| Pulo / Pulo Duplo | Z ou Espaço |
| Atirar | X |
| Atirar Carregado | Segurar X (1.5s) |
| Deslizar (Slide) | Baixo + C |

## 🛠️ Stack Técnica
- **Engine:** Phaser 3
- **Resolução:** 256x224 (Original NES)
- **Design Pattern:** Máquina de Estados Finita (FSM)

## 📁 Estrutura de Arquivos
- `index.html`: Ponto de entrada.
- `src/main.js`: Configuração do Phaser.
- `src/Scene.js`: Lógica do cenário e colisões.
- `src/Player.js`: Mecânicas do jogador (FSM).
- `src/Boss.js`: IA do Boss (Mirror Match).
