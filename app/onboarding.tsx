import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useUser } from '@/hooks/user-context';
import { router } from 'expo-router';
import { ONBOARDING_STEPS } from '@/constants/onboarding';
import { COLORS } from '@/constants/colors';
import UserTypeStep from '@/components/onboarding/UserTypeStep';
import PhoneStep from '@/components/onboarding/PhoneStep';
import InterestsStep from '@/components/onboarding/InterestsStep';
import LocationStep from '@/components/onboarding/LocationStep';
import PreferencesStep from '@/components/onboarding/PreferencesStep';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<any>({});
  const { completeOnboarding } = useUser();

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = async () => {
    if (isLastStep) {
      await completeOnboarding(onboardingData);
      router.replace('/(tabs)');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateOnboardingData = (data: any) => {
    setOnboardingData({ ...onboardingData, ...data });
  };

  const renderStepComponent = () => {
    switch (step.component) {
      case 'userType':
        return (
          <UserTypeStep
            data={onboardingData}
            onUpdate={updateOnboardingData}
          />
        );
      case 'phone':
        return (
          <PhoneStep
            data={onboardingData}
            onUpdate={updateOnboardingData}
          />
        );
      case 'interests':
        return (
          <InterestsStep
            data={onboardingData}
            onUpdate={updateOnboardingData}
          />
        );
      case 'location':
        return (
          <LocationStep
            data={onboardingData}
            onUpdate={updateOnboardingData}
          />
        );
      case 'preferences':
        return (
          <PreferencesStep
            data={onboardingData}
            onUpdate={updateOnboardingData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            {ONBOARDING_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index <= currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
          
          <Text style={styles.stepCounter}>
            {currentStep + 1} de {ONBOARDING_STEPS.length}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </View>

          <View style={styles.stepContent}>
            {renderStepComponent()}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={handleBack}
            disabled={currentStep === 0}
          >
            <ChevronLeft size={20} color={currentStep === 0 ? COLORS.black : COLORS.black} />
            <Text style={[styles.backButtonText, currentStep === 0 && styles.buttonTextDisabled]}>
              Voltar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.nextButton]}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>
              {isLastStep ? 'Finalizar' : 'Continuar'}
            </Text>
            {!isLastStep && <ChevronRight size={20} color={COLORS.white} />}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepCounter: {
    textAlign: 'center',
    color: COLORS.black,
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepHeader: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'center',
    lineHeight: 22,
  },
  stepContent: {
    flex: 1,
    minHeight: 300,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 24,
    gap: 8,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    flex: 1,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  backButtonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  buttonTextDisabled: {
    color: COLORS.black,
  },
});