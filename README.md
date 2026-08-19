# 🏋️‍♂️ Gym-Up

> Aplicativo mobile pessoal e gamificado para gerenciamento inteligente de treinos na musculação, integrado à inteligência artificial do **Google Gemini** e arquitetado para **custo zero** (local-first).

---

## ✨ Principais Funcionalidades

### 1. 🤖 Geração de Fichas com IA (Google Gemini)
- **Questionário Interativo**: Coleta de objetivo (*Hipertrofia, Força, Definição, Condicionamento, Saúde Geral*), frequência semanal (2x a 6x), tempo por sessão, nível de experiência, equipamentos disponíveis e limitações/dores a evitar.
- **Divisão Inteligente**: O modelo **Gemini 3.6 Flash** estrutura o plano semanal completo com exercícios, séries, repetições alvo, tempo de descanso e orientações biomecânicas.
- **Resiliência & Modo Offline**: Caso nenhuma chave API seja configurada ou esteja sem internet, o aplicativo gera automaticamente uma periodização padrão inteligente baseada no perfil do usuário.

### 2. ⚡ Execução Prática do Treino & Checklist de Séries
- **Acompanhamento em Tempo Real**: Registro de cargas (kg) e repetições reais por série.
- **Feedback Tátil**: Vibrações táteis (`expo-haptics`) ao ticar cada série concluída.
- **Timer de Descanso Automático**: Dispara o cronômetro assim que a série é finalizada, com atalhos de `+15s / -15s` e notificação ao zerar.

### 3. 🎮 Sistema Completo de Gamificação
- **XP & Níveis Evolutivos**: Ganho de experiência por treino concluído, séries realizadas e bônus de consistência. Evolua de *Iniciante do Ferro* até *Lenda do Aço*.
- **Contador de Streaks**: Acompanhamento diário de dias consecutivos treinados.
- **Conquistas & Badges**: Desbloqueio de insígnias exclusivas (*Primeiro Passo*, *Ritmo Aquecido*, *Disciplina de Ferro*, *10.000 kg Movidos*, *Membro Inferior Honrado*, etc.).
- **Modal de Celebração**: Exibição animada de XP ganho, subida de nível e novos badges.

### 4. 📊 Relatórios de Progresso (Semanal e Mensal)
- **Resumo Semanal**: Taxa de aderência à meta da semana, total de séries feitas, volume em kg e gráfico de distribuição por grupo muscular estimulado.
- **Resumo Mensal**: Retrospectiva dos últimos 30 dias, média de tempo por treino e volume total acumulado ($Séries \times Reps \times Carga$).
- **Histórico Completo**: Registro detalhado de cada sessão realizada.

### 5. 🎨 Design System Dark & Custo Zero
- **Dark Mode Nativo**: Fundo preto profundo (`#0B0E14`), cards grafite (`#151A22`) e acentos neon esmeralda (`#00E676`).
- **100% Gratuito (Local-First)**: Persistência local segura via `@react-native-async-storage/async-storage` sem necessidade de servidores pagos ou banco em nuvem.

---

## 🛠️ Stack Tecnológica

- **Framework**: [Expo 57](https://expo.dev/) (React Native 0.86)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Roteamento**: [Expo Router v57](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Gerenciador de Pacotes**: [pnpm](https://pnpm.io/)
- **Linter & Formatter**: [Biome](https://biomejs.dev/)
- **Inteligência Artificial**: [Google Gen AI SDK / REST API](https://aistudio.google.com/)
- **Armazenamento Local**: `@react-native-async-storage/async-storage`
- **Feedback Tátil**: `expo-haptics`
- **Ícones**: `@expo/vector-icons` (Ionicons) e `lucide-react-native`

---

## 📁 Arquitetura do Projeto

O projeto utiliza o padrão de **Separação Estrita de Responsabilidades (Hooks + Componentes de Apresentação)**:

```
gym-up/
├── app/                          # Rotas declarativas do Expo Router (< 70 linhas cada)
│   ├── (tabs)/                   # Abas principais (Hoje, Meu Plano, Resumo, Perfil)
│   ├── onboarding/quiz.tsx       # Questionário de preferências
│   └── workout/[dayId].tsx       # Tela ativa de treino
├── src/
│   ├── hooks/                    # 🧠 Lógica de Negócio & Estado
│   │   ├── useHomeData.ts
│   │   ├── usePlanData.ts
│   │   ├── useHistoryData.ts
│   │   ├── useProfileData.ts
│   │   ├── useWorkoutSession.ts
│   │   └── useQuizForm.ts
│   ├── components/               # 🎨 Componentes de Apresentação Puros
│   │   ├── home/
│   │   ├── plan/
│   │   ├── history/
│   │   ├── profile/
│   │   ├── quiz/
│   │   └── workout/
│   ├── services/                 # 🔌 Integrações e Banco Local
│   │   ├── gemini.ts             # Motor de IA com fallback
│   │   ├── storage.ts            # Persistência AsyncStorage
│   │   └── gamification.ts       # Regras de XP e Conquistas
│   ├── constants/                # 🎨 Cores, Tipografia e Badges
│   └── types/                    # 🏷️ Tipagens TypeScript
├── assets/                       # Ícones, Splash e Adaptive Icons Dark
├── biome.json                    # Configuração de lint e formatação
└── package.json
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) (v20+ recomendado)
- [pnpm](https://pnpm.io/installation) instalado globalmente (`npm i -g pnpm`)
- Aplicativo **Expo Go** no smartphone (disponível na Google Play Store e Apple App Store) ou um emulador Android/iOS configurado.

### 1. Instalar as dependências
```bash
pnpm install
```

### 2. Configurar Chave da API do Gemini (Opcional)
Você pode adicionar sua chave gratuita do Google AI Studio no arquivo `.env` ou inseri-la diretamente na aba **Perfil** dentro do app:
```env
EXPO_PUBLIC_GEMINI_API_KEY=sua_chave_aqui
```
> *Nota: Caso não adicione nenhuma chave, o aplicativo utilizará a periodização padrão inteligente local.*

### 3. Iniciar o servidor de desenvolvimento
```bash
pnpm start
```
- Pressione `a` para abrir no emulador Android.
- Pressione `i` para abrir no simulador iOS (macOS).
- Pressione `w` para testar no navegador web.
- Ou leia o **QR Code** no terminal com a câmera do celular através do **Expo Go**.

---

## ⚡ Comandos Úteis

| Comando | Descrição |
| :--- | :--- |
| `pnpm start` | Inicia o servidor Expo Metro |
| `pnpm lint` | Executa a verificação de regras de código com Biome |
| `pnpm format` | Formata todos os arquivos do projeto com Biome |
| `pnpm check` | Executa lint e formatação juntos aplicando correções automáticas |
| `pnpm tsc --noEmit` | Verifica tipagem estrita do TypeScript (0 erros) |

---

## ☁️ EAS CI/CD, Variáveis de Ambiente & Preview Workflows

O Gym-Up está configurado para automação de builds com o **EAS (Expo Application Services)**:

### 1. Configuração de Variáveis de Ambiente no EAS
Para que suas variáveis (como `EXPO_PUBLIC_GEMINI_API_KEY`) sejam injetadas com segurança nos builds em nuvem:

```bash
# Definir variável de ambiente no EAS (escopo do projeto)
npx eas-cli@latest env:create --scope project --name EXPO_PUBLIC_GEMINI_API_KEY --value "sua_chave_aqui"
```
*(Ou acerte pelo painel web do Expo em **expo.dev ➔ Seu Projeto ➔ Configuration ➔ Environment Variables**)*.

### 2. Perfis de Build ([eas.json](eas.json))
- **`preview`**:
  - **Android**: Gera um arquivo **`.apk`** pronto para instalar diretamente no seu celular sem precisar de Play Store.
  - **iOS**: Gera build de simulador para testes rápidos.
- **`production`**: Build de produção com auto-incremento de versão.

```bash
# Gerar APK de preview para Android
npx eas-cli@latest build --platform android --profile preview

# Gerar build de preview para iOS
npx eas-cli@latest build --platform ios --profile preview
```

### 3. Workflows Automáticos ([.eas/workflows/preview.yml](.eas/workflows/preview.yml))
Ao abrir um Pull Request para a branch `main` ou disparar manualmente via `workflow_dispatch`, o EAS executa os builds de preview em paralelo na nuvem automaticamente.

---

## 👤 Autor

- **Bruno Fukumori** - [brunofukumori@gmail.com](mailto:brunofukumori@gmail.com)

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

