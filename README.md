# Currículo Limpo

<div align="center">
    <!-- Atualize o link da imagem quando subir o novo logo no repositório -->
    <img src="public/CurriculoLimpo-Logo.png" width="300" alt="Currículo Limpo Logo" />
    <br />
    <p><em>Uma aplicação web para montar currículos enxutos, legíveis e totalmente otimizados para filtros ATS (Applicant Tracking Systems).</em></p>
</div>

---

## 🚀 Destaques do Projeto

- **Foco Absoluto em Legibilidade:** Layout minimalista projetado para ser amigável para leitura humana e perfeito para robôs.
- **Exportação Otimizada:** Geração de PDFs baseados em texto nativo (utilizando `pdf-lib`) e arquivos Word (.docx) sem quebrar a estrutura.
- **Arquitetura 100% Client-Side:** Executado inteiramente no navegador, sem backend, banco de dados ou dependências externas.
- **Privacidade Total:** Seus dados nunca saem da sua máquina. O progresso é salvo localmente no seu navegador via `localStorage`.
- **Suporte Multilíngue:** Interface e exportação com suporte completo para português, inglês e espanhol.

---

## 🧐 O que é ATS e por que isso importa?

**ATS (Applicant Tracking System)**, ou Sistema de Rastreamento de Candidatos, é um software utilizado por equipes de Recursos Humanos (RH) para automatizar e gerenciar processos seletivos.

Quando você envia um currículo para uma vaga, raramente ele vai direto para as mãos de um recrutador. Primeiro, o robô do ATS faz o _parsing_ (leitura e extração de dados) do seu arquivo, buscando palavras-chave, cargos e datas, para então ranquear você em relação aos outros candidatos.

Se o robô não conseguir ler o seu currículo, você recebe uma nota baixa ou é desclassificado automaticamente, mesmo sendo o melhor profissional para a vaga.

### 🏢 Quem usa ATS atualmente?

Estima-se que mais de 90% das grandes empresas e startups utilizam algum tipo de ATS hoje em dia.

- **Plataformas de ATS mais comuns:** Gupy, Workday, Greenhouse, Lever, Taleo, SAP SuccessFactors, Kenoby, Sólides.
- **Empresas que utilizam ATS:** Nubank, Itaú, Mercado Livre, Amazon, Google, Microsoft e praticamente qualquer empresa com alto volume de candidaturas.

---

## 🎯 A Dor para Resolver

**O problema:** Milhares de candidatos altamente qualificados são rejeitados no momento em que clicam em "Enviar". O motivo? Eles utilizam currículos com designs mirabolantes (geralmente feitos no Canva ou com templates complexos do Word), cheios de colunas duplas, tabelas, caixas de texto invisíveis, barras de progresso para habilidades e gráficos.

Quando o ATS tenta ler esses arquivos "bonitos", ele extrai um texto embaralhado, junta datas com nomes de empresas ou, pior, lê apenas uma página em branco. O resultado é a frustração de enviar dezenas de currículos e nunca ser chamado para entrevistas (o famoso "buraco negro" das candidaturas).

**A solução:** O **Currículo Limpo** supre essa exata dor. Nós removemos a complexidade visual e geramos um arquivo com uma **camada de texto linear e perfeita**. O foco volta a ser exclusivamente o que importa: **a sua experiência, suas palavras-chave e suas habilidades**, garantindo que o ATS extraia 100% das suas informações de forma correta e coloque o seu perfil no topo da fila dos recrutadores.

---

## 📋 Sobre o Projeto

Esta ferramenta web guia o usuário no preenchimento do conteúdo por meio de seções padronizadas e validadas. Ao evitar formatações que quebram a leitura automática, o projeto entrega exatamente a estrutura que os recrutadores e os algoritmos buscam.

Se o seu objetivo é superar os filtros iniciais e chegar às entrevistas, o **Currículo Limpo** é o ponto de partida ideal.

---

## 🛠️ Funcionalidades

- **Preenchimento Guiado:** Seções padronizadas para Contato, Resumo, Experiência, Formação, Habilidades, Idiomas e Certificados.
- **Campos Dinâmicos:** Permite adicionar, editar ou remover múltiplas experiências e formações facilmente.
- **Feedback em Tempo Real:** Avisos visuais para campos obrigatórios não preenchidos ou seções incompletas, além de dicas rápidas para ATS.
- **Modo Escuro (Dark Mode):** Interface moderna em tons escuros e roxos para maior conforto visual durante a criação.

---

## 🕹️ Como Funciona

1. **Preenchimento:** Insira seus dados essenciais (nome, e-mail e resumo profissional).
2. **Personalização:** Complete as seções adicionais de acordo com seu histórico e objetivos profissionais, usando as dicas de palavras-chave.
3. **Exportação:** Escolha o formato desejado (PDF ou Word) e faça o download instantâneo. Seu currículo está pronto para o combate.

---

## 💻 Tecnologias Utilizadas

| Tecnologia       | Descrição                                                                                       |
| :--------------- | :---------------------------------------------------------------------------------------------- |
| **React 19**     | Biblioteca para construção da interface de usuário e controle dinâmico de estado.               |
| **Tailwind CSS** | Framework utilitário para uma estilização rápida, responsiva e moderna.                         |
| **PDF-lib**      | Biblioteca utilizada para a geração de arquivos PDF com camadas de texto estritamente lineares. |
| **docx**         | Ferramenta para geração e estruturação de arquivos Word (.docx) nativos.                        |

---
