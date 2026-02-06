import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Book,
  Shield,
  CreditCard,
  Users,
  Calendar,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-context';
import { RADIUS, SHADOWS, SPACING } from '@/constants/colors';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'tickets' | 'events' | 'account' | 'payments';
}

export default function Help() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'Como comprar bilhetes?',
      answer: 'Para comprar bilhetes, navegue até o evento desejado, selecione o tipo de bilhete e quantidade, e siga o processo de checkout. Você pode pagar com cartão de crédito ou débito.',
      category: 'tickets',
    },
    {
      id: '2',
      question: 'Como validar meu bilhete no evento?',
      answer: 'Apresente o QR code do seu bilhete digital na entrada do evento. O organizador irá escaneá-lo para validar sua entrada.',
      category: 'tickets',
    },
    {
      id: '3',
      question: 'Posso cancelar ou transferir meu bilhete?',
      answer: 'As políticas de cancelamento variam por evento. Consulte os termos específicos do evento ou entre em contato com o organizador.',
      category: 'tickets',
    },
    {
      id: '4',
      question: 'Como criar uma conta de promotor?',
      answer: 'Durante o registro, selecione "Promotor" como tipo de conta. Sua conta será analisada e aprovada pela nossa equipe antes de poder criar eventos.',
      category: 'account',
    },
    {
      id: '5',
      question: 'Como criar um evento?',
      answer: 'Acesse o painel do promotor e clique em "Criar Evento". Preencha todas as informações necessárias, incluindo data, local, preços e descrição.',
      category: 'events',
    },
    {
      id: '6',
      question: 'Quando recebo o pagamento dos bilhetes vendidos?',
      answer: 'Os pagamentos são processados após o evento, descontando as taxas da plataforma. O prazo é de 5-7 dias úteis.',
      category: 'payments',
    },
    {
      id: '7',
      question: 'Como alterar informações do meu perfil?',
      answer: 'Vá em Definições > Perfil para editar suas informações pessoais, foto e dados de contato.',
      category: 'account',
    },
    {
      id: '8',
      question: 'Como seguir promotores e artistas?',
      answer: 'Na página do evento ou perfil do promotor, clique no botão "Seguir". Você receberá notificações sobre novos eventos.',
      category: 'general',
    },
  ];

  const categories = [
    { id: 'all', name: 'Todas', icon: Book },
    { id: 'general', name: 'Geral', icon: HelpCircle },
    { id: 'tickets', name: 'Bilhetes', icon: Calendar },
    { id: 'events', name: 'Eventos', icon: Calendar },
    { id: 'account', name: 'Conta', icon: Users },
    { id: 'payments', name: 'Pagamentos', icon: CreditCard },
  ];

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContactSupport = (method: 'email' | 'phone' | 'chat') => {
    switch (method) {
      case 'email':
        Linking.openURL('mailto:suporte@diceapp.com');
        break;
      case 'phone':
        Linking.openURL('tel:+351210000000');
        break;
      case 'chat':
        Alert.alert('Chat', 'Funcionalidade de chat em desenvolvimento');
        break;
    }
  };

  const ContactCard = ({ icon: Icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity style={[styles.contactCard, { borderBottomColor: colors.border }]} onPress={onPress}>
      <View style={[styles.contactIcon, { backgroundColor: colors.primary + '15' }]}>
        <Icon size={24} color={colors.primary} />
      </View>
      <View style={styles.contactContent}>
        <Text style={[styles.contactTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
      <ExternalLink size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Centro de Ajuda',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '600' as const },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={colors.white} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.card }, SHADOWS.sm]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Como podemos ajudar?</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Encontre respostas para as perguntas mais frequentes ou entre em contato conosco
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border }, SHADOWS.sm]}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchText, { color: colors.text }]}
              placeholder="Buscar ajuda..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categories}>
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      selectedCategory === category.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Icon 
                      size={16} 
                      color={selectedCategory === category.id ? colors.white : colors.textSecondary} 
                    />
                    <Text style={[
                      styles.categoryText,
                      { color: colors.text },
                      selectedCategory === category.id && { color: colors.white }
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={[styles.faqSection, { backgroundColor: colors.card }, SHADOWS.sm]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Perguntas Frequentes</Text>
          
          {filteredFAQ.length === 0 ? (
            <View style={styles.emptyState}>
              <HelpCircle size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>Nenhuma pergunta encontrada</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Tente buscar com outras palavras ou entre em contato conosco
              </Text>
            </View>
          ) : (
            filteredFAQ.map((item) => (
              <View key={item.id} style={[styles.faqItem, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(item.id)}
                >
                  <Text style={[styles.faqQuestionText, { color: colors.text }]}>{item.question}</Text>
                  {expandedFAQ === item.id ? (
                    <ChevronUp size={20} color={colors.primary} />
                  ) : (
                    <ChevronDown size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
                
                {expandedFAQ === item.id && (
                  <View style={[styles.faqAnswer, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>{item.answer}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        <View style={[styles.contactSection, { backgroundColor: colors.card }, SHADOWS.sm]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ainda precisa de ajuda?</Text>
          <Text style={[styles.contactDescription, { color: colors.textSecondary }]}>
            Nossa equipe de suporte está disponível para ajudá-lo
          </Text>
          
          <ContactCard
            icon={Mail}
            title="Email"
            subtitle="suporte@lyven.com"
            onPress={() => handleContactSupport('email')}
          />
          
          <ContactCard
            icon={Phone}
            title="Telefone"
            subtitle="+351 21 000 0000"
            onPress={() => handleContactSupport('phone')}
          />
          
          <ContactCard
            icon={MessageSquare}
            title="Chat ao Vivo"
            subtitle="Disponível 24/7"
            onPress={() => handleContactSupport('chat')}
          />
        </View>

        <View style={[styles.resourcesSection, { backgroundColor: colors.card }, SHADOWS.sm]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recursos Adicionais</Text>
          
          <TouchableOpacity style={[styles.resourceItem, { borderBottomColor: colors.border }]}>
            <Shield size={20} color={colors.info} />
            <View style={styles.resourceContent}>
              <Text style={[styles.resourceTitle, { color: colors.text }]}>Política de Privacidade</Text>
              <Text style={[styles.resourceSubtitle, { color: colors.textSecondary }]}>Como protegemos seus dados</Text>
            </View>
            <ExternalLink size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.resourceItem, { borderBottomColor: colors.border }]}>
            <Book size={20} color={colors.success} />
            <View style={styles.resourceContent}>
              <Text style={[styles.resourceTitle, { color: colors.text }]}>Termos de Uso</Text>
              <Text style={[styles.resourceSubtitle, { color: colors.textSecondary }]}>Condições de utilização</Text>
            </View>
            <ExternalLink size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: SPACING.xl,
    margin: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  categories: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  faqSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottomWidth: 1,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500' as const,
    flex: 1,
    marginRight: SPACING.md,
  },
  faqAnswer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  contactSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  contactDescription: {
    fontSize: 14,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
  },
  resourcesSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
  },
  resourceContent: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  resourceSubtitle: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xxxl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
});