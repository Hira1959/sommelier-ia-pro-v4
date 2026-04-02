<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/56210948-6341-4d55-8012-acfadc023b33

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 🚀 Fluxo de Deploy

Este projeto está configurado para **Deploy Contínuo no Vercel** através do GitHub:

1. As alterações são enviadas para o repositório **GitHub**.
2. O **Vercel** detecta o novo commit e realiza o deploy automático.

**Comandos para atualizar o site:**
```bash
git add .
git commit -m "Sua mensagem descritiva"
git push origin main
```
