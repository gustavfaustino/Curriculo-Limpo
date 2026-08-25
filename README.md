# Currículo Limpo

<div align="center">
  <img src="public/CurriculoLimpo-Logo.png" width="300" alt="Logo do Currículo Limpo" />
  <p><em>Crie currículos claros, lineares e preparados para sistemas ATS (Applicant Tracking Systems).</em></p>

  <a href="https://curriculo-limpo.vercel.app/">
    <img src="https://img.shields.io/badge/Acessar%20aplica%C3%A7%C3%A3o-purple?style=for-the-badge" alt="Acessar aplicação" />
  </a>
</div>

## Sobre o projeto

O Currículo Limpo é uma aplicação web para montar currículos com estrutura simples e legível por ATS. O conteúdo é organizado em texto linear, sem tabelas, colunas ou elementos visuais que possam embaralhar a leitura automática.

O currículo é editado no navegador e salvo localmente (`localStorage`). Não há backend para armazenar os dados do currículo. O envio de feedback é opcional e usa um serviço externo de formulário.

## Funcionalidades

- Preenchimento guiado por etapas: perfil, resumo e reconhecimentos, experiência, formação, habilidades, idiomas e certificados.
- Campos dinâmicos para adicionar, editar, reordenar e remover experiências, formações, idiomas e certificados.
- Importação de arquivos `.docx` com extração de texto para currículos ATS, incluindo cabeçalho, links, resumo, reconhecimentos, experiências em blocos lineares, formação, habilidades, idiomas e certificados.
- Validação de progresso e indicação de seções incompletas antes da exportação.
- Exportação para PDF com texto nativo e para Word (`.docx`).
- Interface responsiva, modo claro/escuro e idiomas português, inglês e espanhol.

## Fluxo de uso

1. Preencha o perfil ou importe um arquivo DOCX pelo botão **Importar DOCX**.
2. Revise todas as seções e complete os campos sinalizados como incompletos.
3. Escolha PDF ou Word e gere o currículo ATS.

Após uma importação, revise os campos antes de exportar. Documentos com layout complexo, caixas de texto ou informações em imagens podem exigir ajustes manuais, pois a importação trabalha sobre o texto extraído do DOCX.

## Tecnologias

- React 19 e React DOM
- Tailwind CSS
- `pdf-lib` para geração de PDF
- `docx` para geração de Word
- `mammoth` para extração de texto na importação de DOCX
- Create React App (`react-scripts`)

## Licença

Este projeto é distribuído sob a licença MIT. Consulte o arquivo `LICENSE` para o texto completo.
