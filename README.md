# NLW Pocket — Prompt Manager

Um projeto simples e prático criado durante o NLW Pocket. É uma pequena aplicação web para você guardar, editar e organizar seus prompts de IA — ideal para quem quer um gerenciador rápido e sem frescura.

Usei apenas HTML, CSS e JavaScript puro para manter tudo leve e fácil de entender.

## O que este projeto faz

- Cadastre, edite e procure prompts rapidamente.
- Salve seu trabalho no navegador (localStorage).
- Funcionalidades de usabilidade que tornam o dia a dia mais simples (toasts, confirmação, desfazer).

## Novas funcionalidades (resumido)

- Notificações não-bloqueantes (toasts) para feedback de ações.
- Modal de confirmação customizado antes de remover um prompt.
- Botão "Desfazer" nas notificações para restaurar uma remoção recente.
- Persistência da seleção atual (o prompt aberto continua selecionado após recarregar).
- Função de cópia mais robusta (Clipboard API + fallback).
- Campos de título e conteúdo são limpos automaticamente após salvar.
- Link para o LinkedIn do desenvolvedor no rodapé da aplicação.

## Estrutura

- `index.html` — interface e marcação
- `style.css` — estilos
- `script.js` — lógica e comportamento
- `assets/` — imagens e ícones

## Como testar localmente

1. Clone o repositório ou baixe os arquivos.
2. Abra `index.html` no seu navegador (recomendado: Chrome/Edge/Firefox).

Dica: para testar o fallback da cópia, abra o arquivo local (file://) ou use um servidor HTTP simples.

## Créditos

Projeto e melhorias implementadas por Matheus Meneses Messias — https://www.linkedin.com/in/matheusm-meneses/

Desenvolvido durante o NLW Pocket (Rocketseat).
