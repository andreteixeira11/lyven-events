import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'Como posso comprar bilhetes?',
    answer: 'Para comprar bilhetes, navegue até ao evento desejado, selecione o tipo de bilhete e quantidade, adicione ao carrinho e finalize a compra através da página de checkout.',
  },
  {
    id: '2',
    question: 'Posso cancelar ou reembolsar bilhetes?',
    answer: 'Os bilhetes podem ser cancelados até 24 horas antes do evento. O reembolso será processado no mesmo método de pagamento utilizado na compra, podendo demorar até 5 dias úteis.',
  },
  {
    id: '3',
    question: 'Como acedo aos meus bilhetes?',
    answer: 'Os seus bilhetes ficam disponíveis na secção "Meus Ingressos" da aplicação. Cada bilhete contém um código QR único que deve ser apresentado na entrada do evento.',
  },
  {
    id: '4',
    question: 'Posso transferir bilhetes para outra pessoa?',
    answer: 'Sim, pode transferir bilhetes através da aplicação. Aceda ao bilhete desejado e selecione a opção "Transferir". A pessoa receberá uma notificação para aceitar a transferência.',
  },
  {
    id: '5',
    question: 'O que acontece se perder o meu telemóvel?',
    answer: 'Os seus bilhetes estão associados à sua conta. Pode aceder aos mesmos através de qualquer dispositivo fazendo login na aplicação com as suas credenciais.',
  },
  {
    id: '6',
    question: 'Há taxas adicionais na compra?',
    answer: 'Podem aplicar-se taxas de serviço dependendo do evento e método de pagamento. Todas as taxas são apresentadas claramente antes da finalização da compra.',
  },
  {
    id: '7',
    question: 'Como funciona a entrada no evento?',
    answer: 'Apresente o código QR do seu bilhete na entrada do evento. O código será digitalizado e validado automaticamente. Certifique-se de que tem bateria suficiente no telemóvel.',
  },
  {
    id: '8',
    question: 'Posso comprar bilhetes para menores?',
    answer: 'Sim, pode comprar bilhetes para menores. Alguns eventos podem ter restrições de idade que serão indicadas na descrição do evento.',
  },
  {
    id: '9',
    question: 'Como recebo atualizações sobre o evento?',
    answer: 'Receberá notificações automáticas sobre alterações importantes do evento, como mudanças de horário ou local. Pode também seguir o promotor para receber atualizações regulares.',
  },
  {
    id: '10',
    question: 'O que fazer se o evento for cancelado?',
    answer: 'Se um evento for cancelado, será automaticamente reembolsado no valor total pago. O reembolso será processado no mesmo método de pagamento utilizado na compra.',
  },
];

export default function FAQScreen() {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'FAQ - Perguntas Frequentes',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <HelpCircle size={48} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Perguntas Frequentes</Text>
          <Text style={styles.headerSubtitle}>
            Encontre respostas para as dúvidas mais comuns sobre bilhetes
          </Text>
        </View>

        <View style={styles.faqList}>
          {faqData.map((item) => {
            const isExpanded = expandedItems.includes(item.id);
            
            return (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.questionContainer}
                  onPress={() => toggleExpanded(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.question}>{item.question}</Text>
                  {isExpanded ? (
                    <ChevronUp size={20} color={COLORS.primary} />
                  ) : (
                    <ChevronDown size={20} color={COLORS.gray} />
                  )}
                </TouchableOpacity>
                
                {isExpanded && (
                  <View style={styles.answerContainer}>
                    <Text style={styles.answer}>{item.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Não encontrou a resposta que procurava?
          </Text>
          <Text style={styles.contactText}>
            Entre em contacto connosco através da secção de ajuda.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginTop: 16,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  faqList: {
    paddingHorizontal: 20,
  },
  faqItem: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginRight: 12,
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  answer: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 12,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'center',
  },
});