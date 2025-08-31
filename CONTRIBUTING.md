# Contribuindo para o BikeFix 🚴‍♂️

Obrigado por considerar contribuir para o BikeFix! Este documento fornece diretrizes para contribuições.

## 🤝 Como Contribuir

### 1. Fork do Repositório
- Faça um fork do repositório para sua conta GitHub
- Clone o fork para sua máquina local

```bash
git clone https://github.com/seu-usuario/bikefix.git
cd bikefix
```

### 2. Configuração do Ambiente
- Siga as instruções do README.md para configurar o ambiente de desenvolvimento
- Instale todas as dependências:

```bash
npm run install:all
```

### 3. Criando uma Branch
- Crie uma branch para sua feature ou correção:

```bash
git checkout -b feature/nome-da-sua-feature
# ou
git checkout -b fix/nome-do-bug-corrigido
```

### 4. Padrões de Código

#### Frontend (React)
- Use componentes funcionais com hooks
- Siga a estrutura de pastas existente
- Use nomes descritivos para componentes e funções
- Mantenha componentes pequenos e reutilizáveis

#### Backend (Node.js)
- Use async/await ao invés de callbacks
- Implemente tratamento de erros adequado
- Siga o padrão MVC existente
- Documente APIs com comentários JSDoc

#### Geral
- Use nomes de variáveis em português (padrão do projeto)
- Mantenha consistência com o código existente
- Adicione comentários quando necessário
- Remova console.logs antes do commit

### 5. Commits
- Use mensagens de commit claras e descritivas
- Prefira commits pequenos e focados
- Use o padrão:

```
feat: adiciona nova funcionalidade X
fix: corrige bug Y
docs: atualiza documentação Z
style: ajusta formatação
refactor: refatora código W
test: adiciona testes para V
```

### 6. Testes
- Adicione testes para novas funcionalidades
- Certifique-se de que todos os testes passam:

```bash
npm run test:backend
npm run test:frontend
```

### 7. Pull Request
- Faça push da sua branch para seu fork
- Abra um Pull Request para a branch `main`
- Descreva claramente as mudanças realizadas
- Referencie issues relacionadas se houver

## 📋 Tipos de Contribuição

### 🐛 Reportar Bugs
- Use o template de issue para bugs
- Inclua passos para reproduzir
- Adicione screenshots se aplicável
- Especifique o ambiente (OS, browser, versão)

### 💡 Sugerir Funcionalidades
- Use o template de issue para features
- Descreva o problema que a feature resolve
- Explique a solução proposta
- Considere alternativas

### 📚 Melhorar Documentação
- Corrija erros de digitação
- Adicione exemplos
- Melhore explicações
- Traduza conteúdo

### 🎨 Melhorar UI/UX
- Siga o design system existente
- Mantenha consistência visual
- Considere acessibilidade
- Teste em diferentes dispositivos

## 🔍 Revisão de Código

Todas as contribuições passam por revisão. Os revisores verificam:

- Funcionalidade correta
- Qualidade do código
- Testes adequados
- Documentação atualizada
- Compatibilidade

## 📞 Dúvidas?

Se tiver dúvidas sobre como contribuir:

1. Verifique a documentação existente
2. Procure em issues abertas
3. Abra uma issue com sua dúvida
4. Entre em contato com os mantenedores

## 🙏 Reconhecimento

Todos os contribuidores são reconhecidos no projeto. Suas contribuições ajudam a tornar o BikeFix melhor para toda a comunidade ciclística!

---

**Obrigado por contribuir! 🚴‍♂️💚**