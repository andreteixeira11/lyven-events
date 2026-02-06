import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { CartItem, PurchasedTicket } from '@/types/event';
import { trpcClient } from '@/lib/trpc';

interface CartContextType {
  cartItems: CartItem[];
  purchasedTickets: PurchasedTicket[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (eventId: string, ticketTypeId: string) => void;
  updateQuantity: (eventId: string, ticketTypeId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  completePurchase: (userId: string) => Promise<boolean>;
  oneClickCheckout: (eventId: string, ticketTypeId: string, userId: string, price?: number) => Promise<boolean>;
}

export const [CartProvider, useCart] = createContextHook<CartContextType>(() => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const loadData = async () => {
        try {
          const [storedCart, storedTickets] = await Promise.all([
            AsyncStorage.getItem('cart'),
            AsyncStorage.getItem('purchasedTickets')
          ]);
          
          if (storedCart) {
            setCartItems(JSON.parse(storedCart));
          }
          if (storedTickets) {
            setPurchasedTickets(JSON.parse(storedTickets));
          }
        } catch (error) {
          console.error('Error loading data from storage:', error);
        }
      };
      loadData();
      setInitialized(true);
    }
  }, [initialized]);

  // Save cart to storage whenever it changes
  useEffect(() => {
    AsyncStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save purchased tickets to storage whenever they change
  useEffect(() => {
    AsyncStorage.setItem('purchasedTickets', JSON.stringify(purchasedTickets));
  }, [purchasedTickets]);

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(
        i => i.eventId === item.eventId && i.ticketTypeId === item.ticketTypeId
      );
      
      if (existingItem) {
        return prev.map(i =>
          i.eventId === item.eventId && i.ticketTypeId === item.ticketTypeId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      
      return [...prev, item];
    });
  };

  const removeFromCart = (eventId: string, ticketTypeId: string) => {
    setCartItems(prev =>
      prev.filter(i => !(i.eventId === eventId && i.ticketTypeId === ticketTypeId))
    );
  };

  const updateQuantity = (eventId: string, ticketTypeId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(eventId, ticketTypeId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(i =>
        i.eventId === eventId && i.ticketTypeId === ticketTypeId
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const completePurchase = async (userId: string): Promise<boolean> => {
    try {
      const timestamp = Date.now();
      const ticketsToCreate = cartItems.map((item, index) => {
        const uniqueSuffix = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const ticketId = `ticket_${timestamp}_${index}_${uniqueSuffix}`;
        const qrCode = `LYVEN_${ticketId}_${item.eventId}_${uniqueSuffix.toUpperCase()}`;
        const validUntil = new Date();
        validUntil.setMonth(validUntil.getMonth() + 6);

        console.log('🎫 Criando bilhete com QR Code:', {
          ticketId,
          qrCode,
          eventId: item.eventId,
          quantity: item.quantity,
        });

        return {
          id: ticketId,
          eventId: item.eventId,
          userId,
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
          price: item.price,
          qrCode,
          validUntil: validUntil.toISOString(),
        };
      });

      await trpcClient.tickets.batchCreate.mutate({ tickets: ticketsToCreate });
      console.log('✅ Bilhetes criados no backend com sucesso');

      const newTickets: PurchasedTicket[] = ticketsToCreate.map((ticket) => ({
        id: ticket.id,
        eventId: ticket.eventId,
        ticketTypeId: ticket.ticketTypeId,
        quantity: ticket.quantity,
        purchaseDate: new Date(),
        qrCode: ticket.qrCode,
      }));

      setPurchasedTickets((prev) => [...prev, ...newTickets]);
      console.log('✅ Bilhetes adicionados à lista de comprados');
      clearCart();
      return true;
    } catch (error) {
      console.error('❌ Erro ao completar compra:', error);
      return false;
    }
  };

  const oneClickCheckout = async (eventId: string, ticketTypeId: string, userId: string, price?: number): Promise<boolean> => {
    try {
      const timestamp = Date.now();
      const uniqueSuffix = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const ticketId = `ticket_${timestamp}_${uniqueSuffix}`;
      const qrCode = `LYVEN_${ticketId}_${eventId}_${uniqueSuffix.toUpperCase()}`;
      const validUntil = new Date();
      validUntil.setMonth(validUntil.getMonth() + 6);

      const ticketToCreate = {
        id: ticketId,
        eventId,
        userId,
        ticketTypeId,
        quantity: 1,
        price: price || 0,
        qrCode,
        validUntil: validUntil.toISOString(),
      };

      await trpcClient.tickets.batchCreate.mutate({ tickets: [ticketToCreate] });
      console.log('✅ Bilhete 1-Click criado com sucesso');

      const newTicket: PurchasedTicket = {
        id: ticketToCreate.id,
        eventId: ticketToCreate.eventId,
        ticketTypeId: ticketToCreate.ticketTypeId,
        quantity: ticketToCreate.quantity,
        purchaseDate: new Date(),
        qrCode: ticketToCreate.qrCode,
      };

      setPurchasedTickets((prev) => [...prev, newTicket]);
      return true;
    } catch (error) {
      console.error('❌ Erro no checkout 1-click:', error);
      return false;
    }
  };

  return {
    cartItems,
    purchasedTickets,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    completePurchase,
    oneClickCheckout
  };
});