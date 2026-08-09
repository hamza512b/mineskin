---
title: "Guia de Uso"
description: "Aprenda a usar o MineSkin PRO - o poderoso editor e visualizador de skins de Minecraft"
---

## Visão Geral

O MineSkin PRO é um editor e visualizador de skins de Minecraft com visualização 3D em tempo real. Ele roda inteiramente no seu dispositivo — no navegador ou como app de iOS e Android. Pinte pixel por pixel direto no modelo 3D, mantenha uma biblioteca de skins, escolha cores a partir de imagens de referência e exporte um PNG pronto para o Minecraft.

---

## Primeiros Passos

### Usuários de Primeira Viagem

No app de iOS e Android, um fluxo rápido de boas-vindas aparece na primeira abertura para você definir seu idioma e suas preferências de cookies. Na web não existe esse fluxo de boas-vindas — só o aviso de cookies.

De qualquer forma, na primeira vez que você entra no modo **Editor**, um tutorial interativo mostra o básico. Você pode reiniciá-lo quando quiser em **Configurações → Ajuda → Reiniciar Tutorial**.

### Início Rápido

1. Abra a **Biblioteca** na barra inferior e crie uma skin — comece por um modelo, carregue um PNG ou importe a partir de um nome de usuário do Minecraft.
2. Escolha uma cor e depois um pincel no botão **Pincéis**, na barra de ferramentas à esquerda.
3. Pinte direto no modelo 3D.
4. Seu trabalho é salvo na biblioteca automaticamente. Para tirar um PNG de lá, abra a **Biblioteca** e escolha **Baixar** na skin.

---

## Modos

Troque de modo pelo seletor na barra inferior.

### Modo Editor

- Todas as ferramentas de desenho, pincéis e imagens de referência
- Visualização 3D em tempo real enquanto você pinta
- Desfazer/refazer, grade e simetria

### Modo Visualização

- Veja sua skin em 3D, sem as ferramentas de edição
- Reproduza animações e faça a cabeça seguir o cursor
- Tire capturas de tela e grave clipes para compartilhar

---

## Sua Biblioteca de Skins

Abra a **Biblioteca** na barra inferior. Ela guarda todas as skins que você já criou, com a ativa marcada.

### Criando uma Skin

**Biblioteca → Nova Skin** oferece:

- **Modelos:** Vazia, Steve (braços clássicos) e Alex (braços slim)
- **Importar do Minecraft:** digite um nome de usuário do Minecraft para puxar a skin atual daquele jogador
- **Carregar Arquivo:** arraste e solte um PNG, ou procure um no dispositivo

São aceitos PNGs de **64×64**, **64×32** (formato antigo) ou **128×128**.

### Gerenciando Skins

Cada skin da biblioteca pode ser:

- **Renomeada** — o nome também é usado nos arquivos exportados
- **Baixada** — salva um PNG pronto para enviar ao Minecraft
- **Excluída** — ao excluir a última skin, você fica com uma skin nova e vazia

### Onde as Skins Ficam Salvas

As skins ficam **localmente no seu dispositivo**, e cada edição é salva automaticamente enquanto você pinta — então seu trabalho sobrevive a um recarregamento. Como o armazenamento é local, limpar os dados do navegador ou do aplicativo vai apagá-las. Baixe tudo o que você não quer perder.

---

## Pincéis

O botão **Pincéis**, na barra de ferramentas à esquerda, mostra o pincel que você está usando. Clique nele para abrir o painel de pincéis — um painel flutuante ao lado no desktop, e um painel que sobe de baixo em dispositivos com toque.

- **Ferramenta caneta** (`P`) — pinta um pixel por clique ou arraste
- **Pintura em massa** (`U`) — preenche uma face inteira, ou um disco de pixels
- **Sombreamento** (`V`) — escurece ou clareia o que já está ali, dando profundidade
- **Pontilhado** (`D`) — pinta um xadrez de 50% com a sua cor por cima do que está embaixo
- **Borracha** (`E`) — apaga os pixels, deixando-os transparentes

### Opções do Pincel

Cada pincel mostra suas próprias opções no painel:

- **Pintura em massa → Raio:** `0` preenche a face inteira em que você clicou; `1`–`8` preenche um disco com essa quantidade de pixels ao redor do ponto atingido. Com raio acima de 0, você também pode escolher a **Forma**: **Quadrado** ou **Círculo**.
- **Sombreamento → Intensidade:** `1`–`6`, o quanto cada passo de sombreamento é forte.
- **Borracha → Tamanho:** `0`–`8`, mostrado como o diâmetro resultante em pixels.

Caneta, sombreamento e pontilhado sempre afetam um único pixel, por isso não têm controle de tamanho.

### Simetria

A **Simetria** (`M`) espelha cada traço no outro lado do modelo — pinte o braço esquerdo e o direito acompanha. Ative e desative pelo painel de pincéis. Enquanto ela estiver ligada, um botão de atalho aparece na barra de ferramentas para você desligá-la sem abrir o painel.

---

## Cor

### Seletor de Cores

A amostra de cor no topo da barra de ferramentas à esquerda abre o seletor completo:

- Escolha no campo de saturação/luminosidade e no controle de matiz
- Digite um **Código Hex** exato
- Ajuste a **Opacidade**
- Vá para a aba **Paleta** para reaproveitar cores que já existem na sua skin

> A opacidade só vale para a camada de **Armadura** (sobreposição). A camada de Corpo é renderizada sólida no jogo, então a tinta ali é sempre totalmente opaca.

### Conta-gotas (`I`)

Clique no botão do conta-gotas e depois clique em qualquer pixel do modelo 3D para transformar a cor dele na sua cor de pintura.

---

## Imagens de Referência

Pressione `R` ou clique no botão **Imagens de referência** para abrir o painel de referência, encaixado ao lado da área 3D no Modo Editor.

- Adicione até **12** imagens
- Arraste sobre a imagem para mirar e solte para escolher aquela cor como sua cor de pintura
- **Aumentar zoom / Diminuir zoom / Redefinir zoom** para trabalhar com detalhes finos
- A linha **Cores desta imagem** mostra as cores dominantes da imagem como amostras
- Remova as imagens que você não precisa mais

---

## Partes do Corpo e Camadas

Toda skin tem duas camadas:

- **Corpo** — a textura base da skin
- **Armadura** — a camada de sobreposição (capacetes, jaquetas, mangas e calças)

Oculte as partes que você não está editando para alcançar superfícies que ficariam escondidas — por exemplo, oculte a camada de Armadura para pintar a cabeça que está embaixo dela.

- **Desktop:** o painel de partes fica no canto superior direito da área 3D
- **Toque:** toque no botão **Filtro de Partes** na barra de ferramentas para abri-lo como um diálogo

Você pode alternar cada parte individualmente (cabeça, tronco, braços e pernas) ou alternar uma camada inteira de uma vez.

---

## Câmera e Visualização

### Gizmo de Rotação

O gizmo no canto superior direito mostra para onde a câmera está apontando. Arraste-o para orbitar ao redor do modelo.

### Mouse e Toque

- **Arrastar:** orbita a câmera
- **Scroll / pinça:** aproxima e afasta

A câmera continua deslizando depois que você solta, e o quanto ela desliza é controlado pela configuração de amortecimento.

### Olhar para o Cursor

No Modo Visualização em desktop, **Olhar para o Cursor** faz a cabeça do modelo seguir o seu ponteiro pela tela.

### Configurações da Câmera

Em **Configurações → Preferências → Câmera**:

- **Campo de Visão** — o quanto a perspectiva é aberta
- **Velocidade de Movimento** — `0`–`0.5`, com que rapidez a câmera responde
- **Amortecimento** — `0`–`1`, com que rapidez o movimento se acomoda

> Curiosidade: coloque o amortecimento em 0 e a câmera vai girar para sempre.

---

## Grade

O botão **Grade** na barra de ferramentas (Modo Editor) sobrepõe guias de pixel no modelo, o que ajuda no alinhamento e na simetria.

---

## Animações

No Modo Visualização, o botão **Animações** coloca o modelo em um loop:

- Parado
- Andando
- Correndo
- Voando
- Acenando
- Agachado
- Levando dano

Escolha **Sem Animação** para devolver o modelo à pose de descanso.

---

## Capturas de Tela e Clipes

Os dois ficam na barra de ferramentas do Modo Visualização.

### Captura de tela

Captura um PNG quadrado de 1080×1080 do modelo, com um pequeno selo do MineSkin. Você vê uma prévia primeiro e depois escolhe salvar ou compartilhar.

### Gravar clipe

Grava um vídeo curto na vertical (9:16) com a sua skin girando, selo incluído. Uma tela de progresso aparece enquanto o vídeo é renderizado, e você pode cancelar a qualquer momento. Quando terminar, veja a prévia do clipe e depois compartilhe ou baixe.

---

## Configurações

Abra o painel de **Configurações** pelo ícone de engrenagem na barra de ferramentas. Ele tem três abas.

### Ações

- **Modo Slim** — alterna entre o clássico (braços de 4px) e o slim/"Alex" (braços de 3px). Isso modifica a textura da skin, então será pedida uma confirmação.
- **Resolução dupla (128×128)** — dobra a resolução da textura. Também é uma alteração que modifica a textura. Lembre que o **Minecraft (Java Edition) não suporta skins 128×128**.
- **Inverter frente e costas** — troca a frente e as costas de cada parte do corpo, fazendo a skin virar para o outro lado.

### Preferências

**Pintura** (Modo Editor)

- **Intensidade do Sombreamento** — `1`–`6`

**Skin**

- **Brilho da Superfície** — `0`–`1`, a iluminação difusa no modelo
- **Brilho/Lustro** — `0`–`1`, os reflexos especulares
- **Mover Esquerda/Direita**, **Mover Frente/Trás**, **Mover Cima/Baixo** — de `-100` a `100`
- **Inclinar Cima/Baixo**, **Girar Esquerda/Direita**, **Rolar** — rotação completa em cada eixo

> Os três controles de posição ficam bloqueados enquanto um ambiente 3D está ativo, já que é o ambiente que posiciona o modelo para você.

**Câmera** — Campo de Visão, Velocidade de Movimento e Amortecimento (veja Câmera e Visualização)

**Luz**

- **Luz Principal** — `0`–`1`, a intensidade da luz direcional
- **Luz Esquerda/Direita**, **Luz Cima/Baixo**, **Luz Frente/Trás** — de `-10` a `10`
- **Brilho Geral (Luz Ambiente)** — `0`–`1`, a iluminação base uniforme

**Ambiente** — alterne entre os cenários de fundo:

- **Grade** — a grade de referência padrão
- **Vazio** — um gradiente simples
- **Campo de Dia** — uma cena 3D ao ar livre
- **Arena** — uma cena estilizada em ambiente fechado

**Idioma** — Inglês, Árabe, Chinês, Espanhol e Português (Brasil)

**Aparência** — tema Sistema, Claro ou Escuro

### Ajuda

- Reinicie o tutorial interativo
- Relate um problema (você pode anexar uma captura de tela; não precisa de conta)
- Links para este guia, o histórico de alterações, o servidor do Discord e o repositório do GitHub
- Links para os apps de iOS e Android

---

## Histórico

- **Desfazer:** `Ctrl+Z` (Windows/Linux) ou `⌘+Z` (Mac)
- **Refazer:** `Ctrl+Shift+Z` / `Ctrl+Y`, ou `⌘+Shift+Z` (Mac)
- Os botões dos dois ficam na barra de ferramentas à esquerda

> O histórico de desfazer **não** é mantido depois de recarregar a página. A sua skin em si fica salva, mas os passos que levaram até ela são apagados.

---

## Atalhos de Teclado

### Ferramentas

- `P` — Ferramenta caneta
- `U` — Pintura em massa
- `V` — Sombreamento
- `D` — Pontilhado
- `E` — Borracha
- `I` — Conta-gotas
- `M` — Ativar/desativar a simetria
- `R` — Abrir/fechar o painel de referência

### Histórico

- `Ctrl/⌘ + Z` — Desfazer
- `Ctrl/⌘ + Shift + Z` ou `Ctrl + Y` — Refazer

> Os atalhos de uma letra só são ignorados enquanto você digita em um campo de texto, então preencher um código hex ou renomear uma skin não troca de ferramenta.

---

## Toque e Dispositivos Móveis

O editor funciona por completo com toque:

- Arraste para orbitar e use a pinça para dar zoom
- O painel de pincéis abre na parte de baixo da tela — a fileira de ferramentas fica sempre visível, e a seta abre a paleta de cores, a simetria e as opções do pincel ativo
- O filtro de partes abre como um diálogo em tela cheia

### Modo Desenhar x Modo Visualizar

Em dispositivos com toque no Modo Editor, um dedo pode pintar ou mover a câmera — mas não as duas coisas. O botão **Modo Desenhar / Modo Visualizar** na barra de ferramentas alterna entre eles:

- **Modo Desenhar** — um dedo pinta; dois dedos continuam dando zoom com a pinça
- **Modo Visualizar** — um dedo orbita a câmera

---

## Aplicativos

O MineSkin PRO também está disponível como app nativo na **App Store** e no **Google Play**, e como aplicativo web instalável (PWA) com suporte offline. O editor é o mesmo em todos eles.

---

## Dicas e Boas Práticas

1. **Oculte camadas para alcançar o que está embaixo** — a camada de Armadura cobre a camada de Corpo em tudo o que estiver visível.
2. **Use a grade** para alinhar detalhes ou combinar os dois lados do modelo.
3. **A simetria economiza metade do trabalho** em tudo que é espelhado — mangas, pernas, rostos.
4. **Prefira o pontilhado aos preenchimentos chapados** para conseguir uma textura que não pareça pintada por cima.
5. **Imagem de referência é melhor do que chute** — jogue uma arte no painel e tire as cores direto dela.
6. **Baixe a skin sempre que atingir um marco.** As skins ficam salvas localmente, e o histórico de desfazer não sobrevive a um recarregamento.
7. **Confira sua skin sob iluminações diferentes** antes de exportar — as configurações de luz revelam as emendas que uma luz chapada esconde.

---

## Suporte e Comunidade

### Reportar Problemas

Encontrou um bug? Use **Configurações → Ajuda → Relatar um problema** ou abra uma issue no [Repositório do GitHub](https://github.com/hamza512b/mineskin/issues).

### Junte-se à Comunidade

Conecte-se com outros criadores de skins no [Servidor do Discord](https://discord.gg/2egvhmqdza).

---

Feito com ❤️ por [Hamza](https://hamza.se)
