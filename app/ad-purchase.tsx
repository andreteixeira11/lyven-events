import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  Eye,
  CheckCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Target,
  CreditCard,
  Upload,
  X,
} from 'lucide-react-native';
import { useUser } from '@/hooks/user-context';
import { COLORS } from '@/constants/colors';

type AdType = 'banner' | 'card' | 'sponsored_event';
type AdDuration = '7' | '14' | '30';

interface AdPackage {
  type: AdType;
  name: string;
  description: string;
  price: number;
  features: string[];
  estimatedViews: string;
}

const adPackages: AdPackage[] = [
  {
    type: 'banner',
    name: 'Banner Premium',
    description: 'Banner destacado no topo da página inicial',
    price: 299,
    features: [
      'Posição premium no topo',
      'Visibilidade máxima',
      'Design personalizado',
      'Link direto para evento'
    ],
    estimatedViews: '10K-15K'
  },
  {
    type: 'card',
    name: 'Card Promocional',
    description: 'Card promocional integrado na lista de eventos',
    price: 199,
    features: [
      'Integração natural',
      'Boa visibilidade',
      'Formato compacto',
      'Call-to-action incluído'
    ],
    estimatedViews: '5K-8K'
  },
  {
    type: 'sponsored_event',
    name: 'Evento Patrocinado',
    description: 'Destaque especial para seu evento',
    price: 149,
    features: [
      'Badge "Patrocinado"',
      'Posição privilegiada',
      'Destaque visual',
      'Maior engajamento'
    ],
    estimatedViews: '3K-5K'
  }
];

const durationPricing = {
  '7': { multiplier: 1, label: '7 dias' },
  '14': { multiplier: 1.8, label: '14 dias' },
  '30': { multiplier: 3.2, label: '30 dias' }
};

type Step = 'package' | 'duration' | 'content' | 'review' | 'confirmation';

export default function AdPurchase() {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState<Step>('package');
  const [selectedPackage, setSelectedPackage] = useState<AdPackage | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<AdDuration>('7');
  const [adTitle, setAdTitle] = useState<string>('');
  const [adDescription, setAdDescription] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  if (user?.userType !== 'promoter') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Acesso negado</Text>
      </SafeAreaView>
    );
  }

  const calculateTotalPrice = () => {
    if (!selectedPackage) return 0;
    return Math.round(selectedPackage.price * durationPricing[selectedDuration].multiplier);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'package': return 'Escolher Pacote';
      case 'duration': return 'Duração & Segmentação';
      case 'content': return 'Conteúdo do Anúncio';
      case 'review': return 'Revisão & Pagamento';
      case 'confirmation': return 'Confirmação';
      default: return 'Comprar Espaço Publicitário';
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'package': return selectedPackage !== null;
      case 'duration': return true;
      case 'content': return adTitle && adDescription && imageUrl;
      case 'review': return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (!canProceedToNext()) {
      Alert.alert('Erro', 'Por favor, complete todos os campos obrigatórios.');
      return;
    }

    switch (currentStep) {
      case 'package': setCurrentStep('duration'); break;
      case 'duration': setCurrentStep('content'); break;
      case 'content': setCurrentStep('review'); break;
      case 'review': handleSubmitAd(); break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'duration': setCurrentStep('package'); break;
      case 'content': setCurrentStep('duration'); break;
      case 'review': setCurrentStep('content'); break;
      case 'confirmation': router.back(); break;
      default: router.back(); break;
    }
  };

  const handleSubmitAd = async () => {
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep('confirmation');
    } catch {
      Alert.alert('Erro', 'Ocorreu um erro ao enviar o anúncio. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Necessária',
          'Precisamos de acesso à sua galeria para selecionar imagens.'
        );
        return;
      }

      setIsUploadingImage(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUrl(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao selecionar a imagem. Tente novamente.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
  };

  const PackageCard = ({ pkg }: { pkg: AdPackage }) => (
    <TouchableOpacity
      style={[
        styles.packageCard,
        selectedPackage?.type === pkg.type && styles.selectedPackage
      ]}
      onPress={() => setSelectedPackage(pkg)}
    >
      <View style={styles.packageHeader}>
        <Text style={styles.packageName}>{pkg.name}</Text>
        <Text style={styles.packagePrice}>€{pkg.price}</Text>
      </View>
      <Text style={styles.packageDescription}>{pkg.description}</Text>
      
      <View style={styles.packageFeatures}>
        {pkg.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <CheckCircle size={14} color={COLORS.primary} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.packageStats}>
        <View style={styles.statItem}>
          <Eye size={16} color={COLORS.textSecondary} />
          <Text style={styles.statText}>{pkg.estimatedViews} visualizações</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const DurationOption = ({ duration }: { duration: AdDuration }) => (
    <TouchableOpacity
      style={[
        styles.durationOption,
        selectedDuration === duration && styles.selectedDuration
      ]}
      onPress={() => setSelectedDuration(duration)}
    >
      <Text style={[
        styles.durationText,
        selectedDuration === duration && styles.selectedDurationText
      ]}>
        {durationPricing[duration].label}
      </Text>
      {selectedPackage && (
        <Text style={[
          styles.durationPrice,
          selectedDuration === duration && styles.selectedDurationPrice
        ]}>
          €{Math.round(selectedPackage.price * durationPricing[duration].multiplier)}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderStepIndicator = () => {
    const steps = ['package', 'duration', 'content', 'review', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    
    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          
          return (
            <View key={step} style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                isActive && styles.stepCircleActive,
                isCompleted && styles.stepCircleCompleted
              ]}>
                <Text style={[
                  styles.stepNumber,
                  (isActive || isCompleted) && styles.stepNumberActive
                ]}>
                  {index + 1}
                </Text>
              </View>
              {index < steps.length - 1 && (
                <View style={[
                  styles.stepLine,
                  isCompleted && styles.stepLineCompleted
                ]} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderPackageStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Escolha seu Pacote Publicitário</Text>
      <Text style={styles.stepSubtitle}>
        Selecione o tipo de anúncio que melhor se adequa aos seus objetivos
      </Text>
      
      {adPackages.map((pkg) => (
        <PackageCard key={pkg.type} pkg={pkg} />
      ))}
    </View>
  );

  const renderDurationStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Duração & Segmentação</Text>
      <Text style={styles.stepSubtitle}>
        Configure a duração da sua campanha publicitária
      </Text>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Calendar size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Duração da Campanha</Text>
        </View>
        <View style={styles.durationContainer}>
          <DurationOption duration="7" />
          <DurationOption duration="14" />
          <DurationOption duration="30" />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Target size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Segmentação</Text>
        </View>
        <View style={styles.targetingCard}>
          <Text style={styles.targetingTitle}>Público-Alvo Automático</Text>
          <Text style={styles.targetingDescription}>
            Seu anúncio será exibido para usuários interessados em eventos similares
            baseado em histórico de pesquisas e preferências.
          </Text>
          <View style={styles.targetingFeatures}>
            <Text style={styles.targetingFeature}>• Usuários da sua região</Text>
            <Text style={styles.targetingFeature}>• Interessados na categoria do evento</Text>
            <Text style={styles.targetingFeature}>• Histórico de compras similares</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderContentStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Conteúdo do Anúncio</Text>
      <Text style={styles.stepSubtitle}>
        Crie o conteúdo que será exibido no seu anúncio
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Título do Anúncio *</Text>
        <TextInput
          style={styles.textInput}
          value={adTitle}
          onChangeText={setAdTitle}
          placeholder="Ex: Festival de Música Eletrônica"
          placeholderTextColor={COLORS.textSecondary}
          maxLength={50}
        />
        <Text style={styles.charCount}>{adTitle.length}/50</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Descrição *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={adDescription}
          onChangeText={setAdDescription}
          placeholder="Descreva seu evento de forma atrativa..."
          placeholderTextColor={COLORS.textSecondary}
          multiline
          numberOfLines={3}
          maxLength={150}
        />
        <Text style={styles.charCount}>{adDescription.length}/150</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Imagem do Anúncio *</Text>
        
        {imageUrl ? (
          <View style={styles.imageUploadContainer}>
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.uploadedImage}
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={handleRemoveImage}
            >
              <X size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handlePickImage}
            disabled={isUploadingImage}
          >
            {isUploadingImage ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <>
                <Upload size={32} color={COLORS.primary} />
                <Text style={styles.uploadButtonText}>Fazer Upload de Imagem</Text>
                <Text style={styles.uploadButtonSubtext}>
                  Toque para selecionar da galeria
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
        
        <Text style={styles.inputHint}>
          Recomendamos imagens com resolução mínima de 1200x630px
        </Text>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <TextInput
          style={styles.textInput}
          value={imageUrl.startsWith('file://') ? '' : imageUrl}
          onChangeText={setImageUrl}
          placeholder="Cole o URL da imagem"
          placeholderTextColor={COLORS.textSecondary}
          keyboardType="url"
          editable={!imageUrl.startsWith('file://')}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Link de Destino</Text>
        <TextInput
          style={styles.textInput}
          value={targetUrl}
          onChangeText={setTargetUrl}
          placeholder="https://exemplo.com (opcional)"
          placeholderTextColor={COLORS.textSecondary}
          keyboardType="url"
        />
        <Text style={styles.inputHint}>
          Para onde os usuários serão direcionados ao clicar no anúncio
        </Text>
      </View>

      {imageUrl ? (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Pré-visualização</Text>
          <View style={styles.adPreview}>
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.previewImage}
              resizeMode="cover"
            />
            <View style={styles.previewContent}>
              <Text style={styles.previewAdTitle}>{adTitle || 'Título do Anúncio'}</Text>
              <Text style={styles.previewAdDescription}>
                {adDescription || 'Descrição do anúncio aparecerá aqui...'}
              </Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Revisão & Pagamento</Text>
      <Text style={styles.stepSubtitle}>
        Revise todos os detalhes antes de finalizar sua compra
      </Text>
      
      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Pacote Selecionado</Text>
        <View style={styles.reviewCard}>
          <Text style={styles.reviewPackageName}>{selectedPackage?.name}</Text>
          <Text style={styles.reviewPackageDescription}>{selectedPackage?.description}</Text>
          <Text style={styles.reviewPackagePrice}>€{selectedPackage?.price}</Text>
        </View>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Duração</Text>
        <View style={styles.reviewCard}>
          <Text style={styles.reviewText}>{durationPricing[selectedDuration].label}</Text>
          <Text style={styles.reviewSubtext}>
            Estimativa: {selectedPackage?.estimatedViews} visualizações
          </Text>
        </View>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Conteúdo</Text>
        <View style={styles.reviewCard}>
          <Text style={styles.reviewContentTitle}>{adTitle}</Text>
          <Text style={styles.reviewContentDescription}>{adDescription}</Text>
          {imageUrl && (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.reviewImage}
              resizeMode="cover"
            />
          )}
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <CreditCard size={20} color={COLORS.primary} />
          <Text style={styles.summaryTitle}>Resumo do Pagamento</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Pacote {selectedPackage?.name}:</Text>
          <Text style={styles.summaryValue}>€{selectedPackage?.price}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duração ({durationPricing[selectedDuration].label}):</Text>
          <Text style={styles.summaryValue}>x{durationPricing[selectedDuration].multiplier}</Text>
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>€{calculateTotalPrice()}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Info size={20} color={COLORS.primary} />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Processo de Aprovação</Text>
          <Text style={styles.infoText}>
            Seu anúncio será analisado pela nossa equipe em até 24 horas úteis.
            Você receberá uma notificação quando for aprovado.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderConfirmationStep = () => (
    <View style={styles.confirmationContent}>
      <View style={styles.successIcon}>
        <CheckCircle size={64} color={COLORS.primary} />
      </View>
      
      <Text style={styles.confirmationTitle}>Anúncio Enviado com Sucesso!</Text>
      <Text style={styles.confirmationSubtitle}>
        Seu anúncio foi enviado para aprovação e será analisado pela nossa equipe.
      </Text>
      
      <View style={styles.confirmationDetails}>
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Pacote:</Text>
          <Text style={styles.confirmationValue}>{selectedPackage?.name}</Text>
        </View>
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Duração:</Text>
          <Text style={styles.confirmationValue}>{durationPricing[selectedDuration].label}</Text>
        </View>
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Total Pago:</Text>
          <Text style={styles.confirmationValue}>€{calculateTotalPrice()}</Text>
        </View>
      </View>
      
      <View style={styles.nextStepsCard}>
        <Text style={styles.nextStepsTitle}>Próximos Passos:</Text>
        <Text style={styles.nextStepsText}>• Análise do conteúdo (até 24h)</Text>
        <Text style={styles.nextStepsText}>• Notificação de aprovação</Text>
        <Text style={styles.nextStepsText}>• Início da campanha</Text>
        <Text style={styles.nextStepsText}>• Relatórios de performance</Text>
      </View>
      
      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => router.back()}
      >
        <Text style={styles.doneButtonText}>Concluir</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'package': return renderPackageStep();
      case 'duration': return renderDurationStep();
      case 'content': return renderContentStep();
      case 'review': return renderReviewStep();
      case 'confirmation': return renderConfirmationStep();
      default: return renderPackageStep();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: getStepTitle(),
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      {currentStep !== 'confirmation' && renderStepIndicator()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>
      
      {currentStep !== 'confirmation' && (
        <View style={styles.bottomNavigation}>
          {currentStep !== 'package' && (
            <TouchableOpacity
              style={styles.backNavButton}
              onPress={handleBack}
            >
              <ChevronLeft size={20} color={COLORS.white} />
              <Text style={styles.backNavText}>Voltar</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              !canProceedToNext() && styles.nextButtonDisabled,
              isSubmitting && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={!canProceedToNext() || isSubmitting}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === 'review' 
                ? (isSubmitting ? 'Processando...' : 'Finalizar Compra')
                : 'Continuar'
              }
            </Text>
            {currentStep !== 'review' && <ChevronRight size={20} color={COLORS.white} />}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.card,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepCircleCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: COLORS.textSecondary,
  },
  stepNumberActive: {
    color: COLORS.white,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  stepLineCompleted: {
    backgroundColor: COLORS.primary,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginLeft: 8,
  },
  targetingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  targetingTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  targetingDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  targetingFeatures: {
    gap: 4,
  },
  targetingFeature: {
    fontSize: 14,
    color: COLORS.text,
  },
  packageCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedPackage: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
  },
  packageDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  packageFeatures: {
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
  packageStats: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  durationOption: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedDuration: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  durationText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  selectedDurationText: {
    color: COLORS.text,
  },
  durationPrice: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.textSecondary,
  },
  selectedDurationPrice: {
    color: COLORS.primary,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontStyle: 'italic' as const,
  },
  previewContainer: {
    marginTop: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  adPreview: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewImage: {
    width: '100%',
    height: 120,
  },
  previewContent: {
    padding: 12,
  },
  previewAdTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  previewAdDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  reviewSection: {
    marginBottom: 20,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  reviewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewPackageName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  reviewPackageDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  reviewPackagePrice: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
  },
  reviewText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  reviewSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  reviewContentTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  reviewContentDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  reviewImage: {
    width: '100%',
    height: 80,
    borderRadius: 6,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
  },
  confirmationContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    marginBottom: 24,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmationSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  confirmationDetails: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmationLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  confirmationValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  nextStepsCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 12,
  },
  nextStepsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.white,
  },
  bottomNavigation: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  backNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 16,
  },
  backNavText: {
    fontSize: 16,
    color: COLORS.white,
    marginLeft: 4,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 16,
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.white,
    marginRight: 4,
  },
  errorText: {
    color: COLORS.primary,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  imageUploadContainer: {
    position: 'relative',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginTop: 12,
  },
  uploadButtonSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginHorizontal: 12,
  },
});