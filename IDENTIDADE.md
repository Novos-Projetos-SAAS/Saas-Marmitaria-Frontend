🎨 Design System - SaaS Marmitaria (Premium com Destaque)

Este documento dita as regras visuais da interface. O objetivo é transmitir confiança, organização e tecnologia através de uma base estrutural sóbria, utilizando uma Cor de Destaque Estratégica (Accent Color) para guiar o olhar do utilizador para as ações principais e informações vitais (como preços e botões), garantindo uma excelente usabilidade e taxa de conversão.

1. Paleta de Cores (Base Sóbria + Destaque Vibrante)

A interface baseia-se em tons de Zinco/Chumbo para a estrutura, deixando as cores vivas exclusivamente para guiar a navegação.

Estrutura e Textos (Base Neutra):

Fundo (Background): #FAFAFA (Cinza muito claro, quase branco. Limpo e higiénico).

Superfícies (Cards/Caixas): #FFFFFF (Branco puro).

Texto Principal (Títulos e Dados): #18181B (Zinco 900 - Quase preto. Passa seriedade).

Texto Secundário (Apoios e Descrições): #71717A (Zinco 500 - Leitura suave).

Bordas e Divisórias: #E4E4E7 (Zinco 200 - Delimita os espaços sem pesar visualmente).

Cor de Destaque (Accent Color):

Laranja Queimado (Burnt Orange): #EA580C

Aplicação: Usada apenas em elementos interativos vitais: botões de navegação primários, destaques de preço e feedback de seleção (borda ativa). Cria um contraste excelente e estimula o apetite de forma sofisticada.

Fundo de Destaque Suave: #FFF7ED (Usado em tags de preço e fundos de cards selecionados, combinado com a borda #FFEDD5).

Cores Semânticas (Status do Sistema):

Sucesso (Aberto/Concluído): Fundo #ECFDF5, Texto #065F46, Borda #A7F3D0.

Aviso/Erro (Fechado/Bloqueado): Fundo #FEF2F2, Texto #991B1B, Borda #FECACA.

2. Tipografia

Família de Fontes: System Fonts (Inter, San Francisco, Roboto). O sistema deve herdar a fonte mais limpa do dispositivo do utilizador (iOS, Android ou Windows).

Hierarquia Visual: * Títulos: Rigorosamente em negrito (700 ou 800) com espaçamento de letras ligeiramente negativo (-0.02em) para um aspeto mais compacto e moderno.

Preços: Destacados como "Tags" (Fundo suave, borda fina e cor de destaque).

Botões de Navegação (ex: Voltar): Em letras maiúsculas (uppercase), peso 700 e espaçadas (letter-spacing: 0.05em) para dar um tom técnico e clareza de ação.

3. Formas e Estrutura (Design Geométrico)

Border Radius (Arredondamento): Foco em cantos mais retos para transmitir precisão sistémica.

Botões Principais e Cards: 6px a 8px.

Etiquetas (Tags de preço) e Badges: 4px.

Profundidade (Sombras): O visual super "3D" é substituído por um Flat Design limpo. Usamos apenas um micro-sombreamento (0 1px 2px rgba(0,0,0,0.02)) misturado com bordas sólidas de 1px em #E4E4E7 para destacar os cards do fundo.

4. Interação (Micro-interações Mobile-First)

Feedback Tátil Rápido: Ao tocar num card ou botão, o elemento sofre uma redução subtil (scale(0.99)), transmitindo a sensação de um "clique num hardware de precisão", sem parecer borracha.

Feedback de Seleção (Check): Elementos selecionados ou tocados "acendem" a sua borda e ícones com a Cor de Destaque (#EA580C) e ganham um fundo levemente colorido (#FFF7ED), deixando óbvio para o utilizador o que foi registado pelo sistema.