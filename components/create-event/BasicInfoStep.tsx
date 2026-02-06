import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { FileText, Tag, ChevronDown } from 'lucide-react-native';
interface BasicInfoStepProps {
  title: string;
  description: string;
  category: string;
  onTitleChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  onCategoryChange: (category: string) => void;
}

const categories = [
  'Música',
  'Teatro',
  'Dança',
  'Comédia',
  'Festival',
  'Conferência',
  'Desporto',
  'Arte',
  'Outro'
];

export default function BasicInfoStep({
  title,
  description,
  category,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
}: BasicInfoStepProps) {
  const [showCategoryPicker, setShowCategoryPicker] = React.useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informações Básicas</Text>
      <Text style={styles.subtitle}>
        Comece com as informações essenciais do seu evento
      </Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputLabel}>
          <FileText size={20} color="#0099a8" />
          <Text style={styles.inputLabelText}>Título do Evento *</Text>
        </View>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={onTitleChange}
          placeholder="Ex: Concerto dos Arctic Monkeys"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputLabel}>
          <FileText size={20} color="#0099a8" />
          <Text style={styles.inputLabelText}>Descrição (opcional)</Text>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={onDescriptionChange}
          placeholder="Descreva o seu evento em detalhe..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputLabel}>
          <Tag size={20} color="#0099a8" />
          <Text style={styles.inputLabelText}>Categoria *</Text>
        </View>
        <TouchableOpacity 
          style={styles.categoryButton} 
          onPress={() => setShowCategoryPicker(!showCategoryPicker)}
        >
          <Text style={[styles.categoryButtonText, !category && styles.placeholder]}>
            {category || 'Selecionar categoria'}
          </Text>
          <ChevronDown size={20} color="#666" />
        </TouchableOpacity>
        
        {showCategoryPicker && (
          <View style={styles.categoryListContainer}>
            <ScrollView style={styles.categoryList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.categoryItem}
                  onPress={() => {
                    onCategoryChange(cat);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.categoryItemText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
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
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  inputLabelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categoryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  categoryListContainer: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryList: {
    maxHeight: 200,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#333',
  },
});
