import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ticket, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native';

export interface TicketTypeForm {
  id: string;
  name: string;
  stage: string;
  price: string;
  quantity: string;
  description: string;
}

interface TicketsStepProps {
  tickets: TicketTypeForm[];
  onAddTicket: () => void;
  onRemoveTicket: (id: string) => void;
  onUpdateTicket: (id: string, field: keyof TicketTypeForm, value: string) => void;
}

const ticketStages = [
  'Early Bird',
  'Normal',
  'VIP',
  'Premium',
  'Gold',
  'Silver',
  'Bronze',
  'Mesa',
  'Pista',
  'Camarote',
  'Balcão',
  'Geral',
];

export default function TicketsStep({
  tickets,
  onAddTicket,
  onRemoveTicket,
  onUpdateTicket,
}: TicketsStepProps) {
  const [expandedTickets, setExpandedTickets] = React.useState<Set<string>>(new Set(['1']));
  const [showStagePicker, setShowStagePicker] = React.useState<string | null>(null);

  const toggleTicketExpansion = (id: string) => {
    setExpandedTickets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isTicketFilled = (ticket: TicketTypeForm): boolean => {
    return !!(ticket.name && ticket.stage && ticket.price && ticket.quantity);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bilhetes</Text>
      <Text style={styles.subtitle}>
        Configure os tipos de bilhetes disponíveis
      </Text>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ticket size={20} color="#0099a8" />
          <Text style={styles.headerTitle}>Tipos de Bilhetes *</Text>
        </View>
        <TouchableOpacity onPress={onAddTicket} style={styles.addButton}>
          <Plus size={18} color="#0099a8" />
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.ticketsList} showsVerticalScrollIndicator={false}>
        {tickets.map((ticket, index) => {
          const isExpanded = expandedTickets.has(ticket.id);
          const isFilled = isTicketFilled(ticket);
          
          return (
            <View 
              key={ticket.id} 
              style={[styles.ticketCard, !isExpanded && isFilled && styles.ticketCardCollapsed]}
            >
              <TouchableOpacity 
                style={styles.ticketHeader}
                onPress={() => toggleTicketExpansion(ticket.id)}
                activeOpacity={0.7}
              >
                <View style={styles.ticketHeaderLeft}>
                  <Text style={styles.ticketTitle}>
                    {ticket.name || `Bilhete ${index + 1}`}
                  </Text>
                  {!isExpanded && isFilled && (
                    <Text style={styles.ticketSubtitle}>
                      {ticket.stage} • €{ticket.price} • {ticket.quantity} bilhetes
                    </Text>
                  )}
                </View>
                <View style={styles.ticketHeaderRight}>
                  {tickets.length > 1 && (
                    <TouchableOpacity 
                      onPress={(e) => {
                        e.stopPropagation();
                        onRemoveTicket(ticket.id);
                      }}
                      style={styles.deleteButton}
                    >
                      <Trash2 size={18} color="#ff3b30" />
                    </TouchableOpacity>
                  )}
                  {isExpanded ? <ChevronUp size={20} color="#0099a8" /> : <ChevronDown size={20} color="#0099a8" />}
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <>
                  <TextInput
                    style={styles.input}
                    value={ticket.name}
                    onChangeText={(text) => onUpdateTicket(ticket.id, 'name', text)}
                    placeholder="Nome do bilhete (ex: Bilhete Normal)"
                    placeholderTextColor="#999"
                  />

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Stage / Tipo</Text>
                    <TouchableOpacity 
                      style={styles.stageButton} 
                      onPress={() => setShowStagePicker(showStagePicker === ticket.id ? null : ticket.id)}
                    >
                      <Text style={[styles.stageButtonText, !ticket.stage && styles.placeholder]}>
                        {ticket.stage || 'Selecionar stage'}
                      </Text>
                      <ChevronDown size={20} color="#666" />
                    </TouchableOpacity>
                    
                    {showStagePicker === ticket.id && (
                      <View style={styles.stageListContainer}>
                        <ScrollView style={styles.stageList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                          {ticketStages.map((stage) => (
                            <TouchableOpacity
                              key={stage}
                              style={styles.stageItem}
                              onPress={() => {
                                onUpdateTicket(ticket.id, 'stage', stage);
                                setShowStagePicker(null);
                              }}
                            >
                              <Text style={styles.stageItemText}>{stage}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputContainer, styles.halfWidth]}>
                      <Text style={styles.inputLabel}>Preço (€)</Text>
                      <TextInput
                        style={styles.input}
                        value={ticket.price}
                        onChangeText={(text) => onUpdateTicket(ticket.id, 'price', text)}
                        placeholder="0.00"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={[styles.inputContainer, styles.halfWidth]}>
                      <Text style={styles.inputLabel}>Quantidade</Text>
                      <TextInput
                        style={styles.input}
                        value={ticket.quantity}
                        onChangeText={(text) => onUpdateTicket(ticket.id, 'quantity', text)}
                        placeholder="100"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={ticket.description}
                    onChangeText={(text) => onUpdateTicket(ticket.id, 'description', text)}
                    placeholder="Descrição (opcional)"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={2}
                  />
                </>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e0f5f7',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#0099a8',
  },
  ticketsList: {
    flex: 1,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  ticketCardCollapsed: {
    padding: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketHeaderLeft: {
    flex: 1,
  },
  ticketHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0099a8',
  },
  ticketSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  stageButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stageButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  stageListContainer: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  stageList: {
    maxHeight: 150,
  },
  stageItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stageItemText: {
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
});
