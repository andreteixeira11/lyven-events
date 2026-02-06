import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import { Platform, Alert, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export interface ShareEventParams {
  eventId: string;
  eventTitle: string;
  eventDescription?: string;
  eventImage?: string;
  eventDate?: Date;
  eventVenue?: string;
  eventPrice?: number;
  platform?: 'whatsapp' | 'facebook' | 'instagram' | 'twitter' | 'copy' | 'system';
}

export async function shareEvent(params: ShareEventParams): Promise<boolean> {
  const { 
    eventId, 
    eventTitle, 
    eventDescription,
    eventDate,
    eventVenue,
    eventPrice,
    eventImage,
    platform = 'system' 
  } = params;
  
  const deepLink = Linking.createURL(`/event/${eventId}`);
  const webShareUrl = `https://www.lyven.pt/event/${eventId}`;
  
  let shareMessage = `🎉 ${eventTitle}\n`;
  
  if (eventDate) {
    const formattedDate = new Intl.DateTimeFormat('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(eventDate);
    shareMessage += `\n📅 ${formattedDate}`;
  }
  
  if (eventVenue) {
    shareMessage += `\n📍 ${eventVenue}`;
  }
  
  if (eventPrice !== undefined && eventPrice > 0) {
    shareMessage += `\n💰 A partir de €${eventPrice}`;
  }
  
  if (eventDescription) {
    const shortDescription = eventDescription.length > 100 
      ? eventDescription.substring(0, 100) + '...' 
      : eventDescription;
    shareMessage += `\n\n${shortDescription}`;
  }
  
  shareMessage += `\n\n🎫 Compra os teus bilhetes aqui:\n${webShareUrl}`;
  
  try {
    if (platform === 'copy') {
      await Clipboard.setStringAsync(deepLink);
      Alert.alert('Link Copiado', 'O link do evento foi copiado para a área de transferência!');
      return true;
    }

    if (platform === 'whatsapp') {
      if (eventImage) {
        return await shareEventWithImage({ ...params, imageUri: eventImage, platform: 'whatsapp' });
      }
      
      if (Platform.OS === 'web') {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
        return true;
      }
      
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        return true;
      } else {
        Alert.alert('WhatsApp não encontrado', 'Por favor, instala o WhatsApp para partilhar.');
        return false;
      }
    }

    if (platform === 'facebook') {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(webShareUrl)}`;
      
      if (Platform.OS === 'web') {
        window.open(facebookUrl, '_blank');
        return true;
      }
      
      const canOpen = await Linking.canOpenURL(facebookUrl);
      
      if (canOpen) {
        await Linking.openURL(facebookUrl);
        return true;
      } else {
        Alert.alert('Facebook não encontrado', 'Por favor, instala o Facebook para partilhar.');
        return false;
      }
    }

    if (platform === 'instagram') {
      const instagramUrl = 'instagram://';
      const canOpen = await Linking.canOpenURL(instagramUrl);
      
      if (canOpen) {
        await Linking.openURL(instagramUrl);
        Alert.alert(
          'Instagram', 
          'Copia este link e partilha na tua história ou publicação!',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Copiar Link', 
              onPress: async () => {
                await Clipboard.setStringAsync(deepLink);
              }
            }
          ]
        );
        return true;
      } else {
        Alert.alert('Instagram não encontrado', 'Por favor, instala o Instagram para partilhar.');
        return false;
      }
    }

    if (platform === 'twitter') {
      const tweetText = `${eventTitle}\n${webShareUrl}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      
      if (Platform.OS === 'web') {
        window.open(twitterUrl, '_blank');
        return true;
      }
      
      const canOpen = await Linking.canOpenURL(twitterUrl);
      
      if (canOpen) {
        await Linking.openURL(twitterUrl);
        return true;
      } else {
        Alert.alert('Twitter/X não encontrado', 'Por favor, instala o Twitter para partilhar.');
        return false;
      }
    }

    if (Platform.OS === 'web') {
      const shareData = {
        title: eventTitle,
        text: shareMessage,
        url: webShareUrl,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return true;
      } else {
        await Clipboard.setStringAsync(webShareUrl);
        Alert.alert('Link Copiado', 'O link do evento foi copiado!');
        return true;
      }
    }

    const shareOptions: any = {
      message: shareMessage,
      title: eventTitle,
    };
    
    if (Platform.OS === 'ios') {
      shareOptions.url = webShareUrl;
    }

    const shareResult = await Share.share(shareOptions);

    return shareResult.action !== Share.dismissedAction;
  } catch (error) {
    console.error('Error sharing event:', error);
    Alert.alert('Erro', 'Não foi possível partilhar o evento. Tenta novamente.');
    return false;
  }
}

export async function shareEventWithImage(params: ShareEventParams & { imageUri?: string }): Promise<boolean> {
  const { 
    imageUri,
    eventId, 
    eventTitle,
    eventDescription,
    eventDate,
    eventVenue,
    eventPrice,
    platform = 'system' 
  } = params;
  
  if (!imageUri || Platform.OS === 'web') {
    return shareEvent(params);
  }
  
  try {
    const webShareUrl = `https://www.lyven.pt/event/${eventId}`;
    
    let shareMessage = `🎉 ${eventTitle}\n`;
    
    if (eventDate) {
      const formattedDate = new Intl.DateTimeFormat('pt-PT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(eventDate);
      shareMessage += `\n📅 ${formattedDate}`;
    }
    
    if (eventVenue) {
      shareMessage += `\n📍 ${eventVenue}`;
    }
    
    if (eventPrice !== undefined && eventPrice > 0) {
      shareMessage += `\n💰 A partir de €${eventPrice}`;
    }
    
    if (eventDescription) {
      const shortDescription = eventDescription.length > 100 
        ? eventDescription.substring(0, 100) + '...' 
        : eventDescription;
      shareMessage += `\n\n${shortDescription}`;
    }
    
    shareMessage += `\n\n🎫 Compra os teus bilhetes aqui:\n${webShareUrl}`;
    
    if (platform === 'whatsapp') {
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (!isAvailable) {
        return shareEvent(params);
      }

      await Sharing.shareAsync(imageUri, {
        dialogTitle: `Partilhar ${eventTitle} no WhatsApp`,
        mimeType: 'image/jpeg',
        UTI: 'public.jpeg',
      });
      
      setTimeout(() => {
        Clipboard.setStringAsync(shareMessage);
      }, 500);
      
      return true;
    }
    
    if (platform === 'system') {
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (!isAvailable) {
        return shareEvent(params);
      }

      await Sharing.shareAsync(imageUri, {
        dialogTitle: `Partilhar ${eventTitle}`,
        mimeType: 'image/jpeg',
      });
      
      return true;
    }
    
    if (platform === 'instagram') {
      const instagramUrl = 'instagram://';
      const canOpen = await Linking.canOpenURL(instagramUrl);
      
      if (canOpen) {
        await Linking.openURL(instagramUrl);
        Alert.alert(
          'Instagram', 
          'Copia este link para partilhar!',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Copiar Link', 
              onPress: async () => {
                await Clipboard.setStringAsync(webShareUrl);
                Alert.alert('Sucesso', 'Link copiado!');
              }
            }
          ]
        );
        return true;
      } else {
        Alert.alert('Instagram não encontrado', 'Por favor, instala o Instagram para partilhar.');
        return false;
      }
    }
    
    return shareEvent(params);
  } catch (error) {
    console.error('Error sharing event with image:', error);
    return shareEvent(params);
  }
}

export interface ShareTicketParams {
  ticketId: string;
  eventTitle: string;
  eventDate: Date;
  eventVenue: string;
  eventImage?: string;
  qrCode: string;
  platform?: 'whatsapp' | 'facebook' | 'instagram' | 'twitter' | 'copy' | 'system';
}

export async function shareTicket(params: ShareTicketParams): Promise<boolean> {
  const { 
    ticketId,
    eventTitle, 
    eventDate,
    eventVenue,
    eventImage,
    platform = 'system' 
  } = params;
  
  const formattedDate = new Intl.DateTimeFormat('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(eventDate);
  
  let shareMessage = `🎫 ${eventTitle}\n`;
  shareMessage += `\n📅 ${formattedDate}`;
  shareMessage += `\n📍 ${eventVenue}`;
  shareMessage += `\n\n✨ Vou estar presente neste evento!`;
  
  try {
    if (platform === 'copy') {
      await Clipboard.setStringAsync(shareMessage);
      Alert.alert('Copiado', 'Informação do bilhete copiada!');
      return true;
    }

    if (platform === 'whatsapp') {
      if (eventImage) {
        return await shareTicketWithImage({ ...params, imageUri: eventImage, platform: 'whatsapp' });
      }
      
      if (Platform.OS === 'web') {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
        return true;
      }
      
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        return true;
      } else {
        Alert.alert('WhatsApp não encontrado', 'Por favor, instala o WhatsApp para partilhar.');
        return false;
      }
    }

    if (Platform.OS === 'web') {
      const shareData = {
        title: `Bilhete - ${eventTitle}`,
        text: shareMessage,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return true;
      } else {
        await Clipboard.setStringAsync(shareMessage);
        Alert.alert('Copiado', 'Informação do bilhete copiada!');
        return true;
      }
    }

    const shareOptions: any = {
      message: shareMessage,
      title: `Bilhete - ${eventTitle}`,
    };

    const shareResult = await Share.share(shareOptions);
    return shareResult.action !== Share.dismissedAction;
  } catch (error) {
    console.error('Error sharing ticket:', error);
    Alert.alert('Erro', 'Não foi possível partilhar o bilhete. Tenta novamente.');
    return false;
  }
}

export async function shareTicketWithImage(params: ShareTicketParams & { imageUri?: string }): Promise<boolean> {
  const { 
    imageUri,
    ticketId,
    eventTitle,
    eventDate,
    eventVenue,
    platform = 'system' 
  } = params;
  
  if (!imageUri || Platform.OS === 'web') {
    return shareTicket(params);
  }
  
  try {
    const formattedDate = new Intl.DateTimeFormat('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(eventDate);
    
    let shareMessage = `🎫 ${eventTitle}\n`;
    shareMessage += `\n📅 ${formattedDate}`;
    shareMessage += `\n📍 ${eventVenue}`;
    shareMessage += `\n\n✨ Vou estar presente neste evento!`;
    
    if (platform === 'whatsapp') {
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (!isAvailable) {
        return shareTicket(params);
      }

      await Sharing.shareAsync(imageUri, {
        dialogTitle: `Partilhar bilhete no WhatsApp`,
        mimeType: 'image/jpeg',
        UTI: 'public.jpeg',
      });
      
      setTimeout(() => {
        Clipboard.setStringAsync(shareMessage);
      }, 500);
      
      return true;
    }
    
    if (platform === 'system') {
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (!isAvailable) {
        return shareTicket(params);
      }

      await Sharing.shareAsync(imageUri, {
        dialogTitle: `Partilhar bilhete - ${eventTitle}`,
        mimeType: 'image/jpeg',
      });
      
      return true;
    }
    
    return shareTicket(params);
  } catch (error) {
    console.error('Error sharing ticket with image:', error);
    return shareTicket(params);
  }
}

export function getDeepLink(path: string): string {
  return Linking.createURL(path);
}

export async function handleDeepLink(url: string): Promise<void> {
  try {
    const { path, queryParams } = Linking.parse(url);
    console.log('Deep link opened:', { path, queryParams });
  } catch (error) {
    console.error('Error handling deep link:', error);
  }
}
