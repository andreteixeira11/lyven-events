import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
  Platform
} from 'react-native';
import {
  ArrowLeft,
  QrCode,
  CheckCircle,
  Flashlight,
  FlashlightOff,
  Camera
} from 'lucide-react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useUser } from '@/hooks/user-context';
import { trpcClient, trpc } from '@/lib/trpc';
import { LoadingSpinner, ErrorState } from '@/components/LoadingStates';
import { handleError } from '@/lib/error-handler';

interface ScannedTicket {
  id: string;
  eventId: string;
  buyerName: string;
  ticketType: string;
  quantity: number;
  isValid: boolean;
  isAlreadyUsed: boolean;
  validatedAt?: Date;
}

export default function QRScannerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [lastScannedTicket, setLastScannedTicket] = useState<ScannedTicket | null>(null);
  const [validatedTickets, setValidatedTickets] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const { data: eventData, isLoading, error, refetch } = trpc.events.get.useQuery(
    { id: id ?? '' },
    { enabled: !!id }
  );
  const event = eventData ? {
    id: eventData.id,
    title: eventData.title,
    image: eventData.image,
    date: new Date(eventData.date),
    endDate: eventData.endDate ? new Date(eventData.endDate) : undefined,
    venue: typeof eventData.venue === 'object' && eventData.venue
      ? { id: (eventData.venue as any).id ?? '', name: (eventData.venue as any).name ?? '', address: (eventData.venue as any).address ?? '', city: (eventData.venue as any).city ?? '', capacity: (eventData.venue as any).capacity ?? 0 }
      : { id: '', name: '', address: '', city: '', capacity: 0 },
  } : null;

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);
  
  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isValidating) return;
    
    setScanned(true);
    setIsValidating(true);
    
    console.log('🔍 Validando QR Code:', data);
    
    try {
      // Validar bilhete no backend
      const result = await trpcClient.tickets.validate.mutate({ 
        qrCode: data,
        validatedBy: user?.id,
      });
      
      console.log('✅ Resultado da validação:', result);
      
      // Verificar se o bilhete é para este evento
      if (result.ticket.eventId !== id) {
        handleInvalidTicket('Bilhete não é para este evento');
        setIsValidating(false);
        return;
      }
      
      // Bilhete válido
      const validatedTicket: ScannedTicket = {
        id: result.ticket.id,
        eventId: result.ticket.eventId,
        buyerName: result.buyer?.name || 'Comprador',
        ticketType: result.ticket.ticketTypeId,
        quantity: result.ticket.quantity,
        isValid: true,
        isAlreadyUsed: true,
        validatedAt: result.ticket.validatedAt ? new Date(result.ticket.validatedAt) : new Date(),
      };
      
      handleValidTicket(validatedTicket, data);
      
    } catch (error: any) {
      console.error('❌ Erro ao validar bilhete:', error);
      
      let errorMessage = 'Erro ao validar bilhete';
      
      if (error.message?.includes('not found')) {
        errorMessage = 'QR Code não reconhecido';
      } else if (error.message?.includes('already used')) {
        errorMessage = 'Bilhete já foi utilizado';
      } else if (error.message?.includes('expired')) {
        errorMessage = 'Bilhete expirado';
      }
      
      handleInvalidTicket(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleValidTicket = (ticket: ScannedTicket, qrCode: string) => {
    // Add haptic feedback
    if (Platform.OS !== 'web') {
      Vibration.vibrate([0, 200, 100, 200]);
    }
    
    const validatedTicket = {
      ...ticket,
      isAlreadyUsed: true,
      validatedAt: new Date()
    };
    
    setLastScannedTicket(validatedTicket);
    setValidatedTickets(prev => [...prev, qrCode]);
    
    // Show success message
    setTimeout(() => {
      Alert.alert(
        '✅ Bilhete Válido',
        `Comprador: ${ticket.buyerName}\nTipo: ${ticket.ticketType}\nQuantidade: ${ticket.quantity}`,
        [
          { 
            text: 'Continuar Scanning', 
            onPress: () => setScanned(false) 
          }
        ]
      );
    }, 500);
  };
  
  const handleInvalidTicket = (reason: string) => {
    // Add error haptic feedback
    if (Platform.OS !== 'web') {
      Vibration.vibrate([0, 500]);
    }
    
    Alert.alert(
      '❌ Bilhete Inválido',
      reason,
      [
        { 
          text: 'Tentar Novamente', 
          onPress: () => setScanned(false) 
        }
      ]
    );
  };
  
  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };
  
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>A solicitar permissões da câmera...</Text>
      </View>
    );
  }
  
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#666" />
          <Text style={styles.permissionTitle}>Permissão da Câmera Necessária</Text>
          <Text style={styles.permissionText}>
            Para validar bilhetes, precisamos de acesso à câmera para ler QR codes.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Conceder Permissão</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="A carregar evento..." />
      </View>
    );
  }
  if (error || !event) {
    return (
      <View style={styles.container}>
        <ErrorState message={error ? handleError(error) : 'Evento não encontrado'} onRetry={error ? () => refetch() : undefined} />
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Scanner QR',
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={toggleFlash}>
              {flashOn ? (
                <FlashlightOff size={24} color="#fff" />
              ) : (
                <Flashlight size={24} color="#fff" />
              )}
            </TouchableOpacity>
          )
        }} 
      />
      
      <View style={styles.container}>
        {/* Event Info */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventVenue}>{event.venue.name}</Text>
          <Text style={styles.validatedCount}>
            {validatedTickets.length} bilhetes validados
          </Text>
        </View>
        
        {/* Camera View */}
        <View style={styles.cameraContainer}>
          {Platform.OS === 'web' ? (
            // Web fallback - show QR code input
            <View style={styles.webFallback}>
              <QrCode size={64} color="#666" />
              <Text style={styles.webFallbackText}>
                Scanner de câmera não disponível na web
              </Text>
              <Text style={styles.webFallbackSubtext}>
                Use a versão mobile para validar bilhetes
              </Text>
            </View>
          ) : (
            <CameraView
              style={styles.camera}
              facing={'back' as CameraType}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              enableTorch={flashOn}
            >
              <View style={styles.overlay}>
                <View style={styles.scanArea}>
                  <View style={styles.scanCorner} />
                  <View style={[styles.scanCorner, styles.scanCornerTopRight]} />
                  <View style={[styles.scanCorner, styles.scanCornerBottomLeft]} />
                  <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />
                </View>
                
                <Text style={styles.scanInstructions}>
                  Aponte a câmera para o QR code do bilhete
                </Text>
              </View>
            </CameraView>
          )}
        </View>
        
        {/* Last Scanned Ticket */}
        {lastScannedTicket && (
          <View style={styles.lastScannedContainer}>
            <View style={styles.lastScannedHeader}>
              <CheckCircle size={20} color="#28A745" />
              <Text style={styles.lastScannedTitle}>Último Bilhete Validado</Text>
            </View>
            <View style={styles.lastScannedInfo}>
              <Text style={styles.lastScannedName}>{lastScannedTicket.buyerName}</Text>
              <Text style={styles.lastScannedDetails}>
                {lastScannedTicket.ticketType} • {lastScannedTicket.quantity} bilhete(s)
              </Text>
              {lastScannedTicket.validatedAt && (
                <Text style={styles.lastScannedTime}>
                  Validado às {new Intl.DateTimeFormat('pt-PT', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(lastScannedTicket.validatedAt)}
                </Text>
              )}
            </View>
          </View>
        )}
        
        {/* Manual Reset Button */}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => setScanned(false)}
            disabled={!scanned || isValidating}
          >
            <QrCode size={20} color={scanned ? "#666" : "#fff"} />
            <Text style={[
              styles.resetButtonText,
              { color: (scanned || isValidating) ? "#666" : "#fff" }
            ]}>
              {isValidating ? 'Validando...' : scanned ? 'Processando...' : 'Pronto para Scan'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  eventInfo: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 4,
  },
  eventVenue: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  validatedCount: {
    fontSize: 14,
    color: '#28A745',
    fontWeight: 'bold' as const,
  },
  cameraContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  webFallbackText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  webFallbackSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  scanCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FF385C',
    borderWidth: 3,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 0,
  },
  scanCornerTopRight: {
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    right: 0,
    left: 'auto' as any,
  },
  scanCornerBottomLeft: {
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
    bottom: 0,
    left: 0,
    top: 'auto' as any,
  },
  scanCornerBottomRight: {
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    bottom: 0,
    right: 0,
    top: 'auto' as any,
    left: 'auto' as any,
  },
  scanInstructions: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 32,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  lastScannedContainer: {
    margin: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#28A745',
  },
  lastScannedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  lastScannedTitle: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#28A745',
  },
  lastScannedInfo: {
    marginLeft: 28,
  },
  lastScannedName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 4,
  },
  lastScannedDetails: {
    fontSize: 14,
    color: '#999',
    marginBottom: 2,
  },
  lastScannedTime: {
    fontSize: 12,
    color: '#666',
  },
  controls: {
    padding: 16,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
});