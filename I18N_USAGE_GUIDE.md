# Sistema de Tradução - Guia de Uso

Sistema completo de internacionalização (i18n) implementado para toda a aplicação usando i18next, react-i18next e expo-localization.

## 📦 Pacotes Instalados

- `i18next` - Framework de i18n
- `react-i18next` - Integração com React
- `expo-localization` - Detecção de idioma do dispositivo

## 🏗️ Estrutura

```
├── lib/
│   └── i18n.ts                    # Configuração do i18n
├── locales/
│   ├── pt.json                    # Traduções em Português
│   └── en.json                    # Traduções em Inglês
├── hooks/
│   └── i18n-context.tsx           # Context Provider para i18n
└── app/
    ├── _layout.tsx                # Provider adicionado aqui
    └── language.tsx               # Tela de seleção de idioma
```

## 🚀 Como Usar nas Telas

### 1. Importar o Hook

```typescript
import { useTranslation } from 'react-i18next';
```

### 2. Usar nas Telas/Componentes

```typescript
export default function MinhaTelaScreen() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('common.welcome')}</Text>
      <Text>{t('events.upcoming')}</Text>
      <Button title={t('common.save')} />
    </View>
  );
}
```

### 3. Usar em Títulos de Stack.Screen

```typescript
<Stack.Screen
  options={{
    title: t('events.title'),
  }}
/>
```

### 4. Usar com Context do I18n

```typescript
import { useI18n } from '@/hooks/i18n-context';

export default function MinhaScreen() {
  const { currentLanguage, switchLanguage } = useI18n();
  
  return (
    <View>
      <Text>Idioma atual: {currentLanguage}</Text>
      <Button 
        title="Mudar para Inglês" 
        onPress={() => switchLanguage('en')} 
      />
    </View>
  );
}
```

## 📝 Estrutura das Traduções

Os arquivos de tradução estão organizados por categoria:

```json
{
  "common": {
    "welcome": "Bem-vindo",
    "save": "Guardar",
    "cancel": "Cancelar"
  },
  "auth": {
    "login": "Entrar",
    "email": "Email",
    "password": "Palavra-passe"
  },
  "events": {
    "title": "Eventos",
    "upcoming": "Próximos Eventos"
  },
  "tickets": {
    "myTickets": "Os Meus Bilhetes"
  },
  "profile": {
    "settings": "Definições"
  },
  "promoter": {
    "dashboard": "Painel de Controlo",
    "welcome": "Bem-vindo"
  },
  "admin": {
    "adminDashboard": "Painel de Administração"
  }
}
```

## 🔧 Funcionalidades

### ✅ Persistência
- O idioma selecionado é guardado no AsyncStorage
- Persiste entre sessões da app

### ✅ Detecção Automática
- Detecta o idioma do dispositivo na primeira execução
- Fallback para Português se o idioma não estiver disponível

### ✅ Idiomas Disponíveis
- 🇵🇹 Português (pt)
- 🇬🇧 Inglês (en)

## 📱 Tela de Seleção de Idioma

A tela `app/language.tsx` já está integrada com o sistema:
- Mostra os idiomas disponíveis
- Permite alternar entre idiomas
- Guarda a preferência do utilizador
- Atualiza toda a app instantaneamente

## 🎯 Exemplos de Uso Completo

### Exemplo 1: Tela de Eventos

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function EventsScreen() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('events.title')}</Text>
      <Text>{t('events.upcoming')}</Text>
      <Text>{t('events.past')}</Text>
    </View>
  );
}
```

### Exemplo 2: Botões com Tradução

```typescript
<TouchableOpacity onPress={handleSave}>
  <Text>{t('common.save')}</Text>
</TouchableOpacity>

<TouchableOpacity onPress={handleCancel}>
  <Text>{t('common.cancel')}</Text>
</TouchableOpacity>
```

### Exemplo 3: Mensagens de Erro

```typescript
try {
  await saveData();
} catch (error) {
  Alert.alert(
    t('common.error'),
    t('errors.somethingWentWrong')
  );
}
```

### Exemplo 4: Tela de Perfil

```typescript
export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user } = useUser();
  
  return (
    <View>
      <Text>{t('common.welcome')}, {user?.name}!</Text>
      <MenuItem title={t('profile.settings')} />
      <MenuItem title={t('profile.notifications')} />
      <MenuItem title={t('profile.help')} />
    </View>
  );
}
```

## 🔄 Como Adicionar Novas Traduções

1. Abrir `locales/pt.json` e adicionar a nova chave:
```json
{
  "mySection": {
    "myNewKey": "Meu Novo Texto"
  }
}
```

2. Abrir `locales/en.json` e adicionar a tradução:
```json
{
  "mySection": {
    "myNewKey": "My New Text"
  }
}
```

3. Usar no código:
```typescript
<Text>{t('mySection.myNewKey')}</Text>
```

## 🌍 Como Adicionar Novos Idiomas

1. Criar novo arquivo de tradução: `locales/es.json`
2. Copiar estrutura de `pt.json` e traduzir
3. Adicionar ao `lib/i18n.ts`:
```typescript
import es from '@/locales/es.json';

const resources = {
  pt: { translation: pt },
  en: { translation: en },
  es: { translation: es }, // Novo idioma
};
```
4. Adicionar à lista em `app/language.tsx`:
```typescript
const LANGUAGES: Language[] = [
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
];
```

## 💡 Dicas

1. **Use chaves descritivas**: `events.upcoming` em vez de `event1`
2. **Organize por categoria**: Agrupe traduções relacionadas
3. **Mantenha consistência**: Use os mesmos termos em todas as traduções
4. **Teste ambos os idiomas**: Verifique se todas as traduções funcionam
5. **Use interpolação** quando necessário:
```typescript
// Em pt.json: "welcome": "Bem-vindo, {{name}}!"
t('common.welcome', { name: user.name })
```

## 🐛 Troubleshooting

### Tradução não aparece
- Verificar se a chave existe em ambos os arquivos (pt.json e en.json)
- Verificar se importou `useTranslation` corretamente
- Verificar console para erros do i18next

### Idioma não persiste
- Verificar se o AsyncStorage está a funcionar
- Verificar se o I18nProvider está no _layout.tsx

### Crash ao mudar idioma
- Verificar se todas as chaves existem em todos os idiomas
- Adicionar fallbackLng no i18n.ts

## 📚 Próximos Passos

Para traduzir toda a app, siga este padrão em todas as telas:

1. Importar `useTranslation`
2. Obter função `t`
3. Substituir textos hardcoded por `t('categoria.chave')`
4. Adicionar traduções necessárias nos arquivos JSON

## ✨ Exemplo Completo - Antes e Depois

### ❌ Antes (Sem Tradução)
```typescript
<Text>Próximos Eventos</Text>
<Button title="Comprar Bilhetes" />
<Text>Localização</Text>
```

### ✅ Depois (Com Tradução)
```typescript
const { t } = useTranslation();

<Text>{t('events.upcoming')}</Text>
<Button title={t('events.buyTickets')} />
<Text>{t('events.location')}</Text>
```

---

**Sistema implementado e pronto a usar em toda a aplicação!** 🎉
