import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, tickets, events, users } from '@/backend/db';
import { eq } from 'drizzle-orm';

export const generateWalletPassProcedure = publicProcedure
  .input(
    z.object({
      ticketId: z.string(),
      platform: z.enum(['ios', 'android']),
    })
  )
  .mutation(async ({ input }) => {
    const ticket = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, input.ticketId))
      .limit(1);

    if (!ticket || ticket.length === 0) {
      throw new Error('Bilhete não encontrado');
    }

    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, ticket[0].eventId))
      .limit(1);

    if (!event || event.length === 0) {
      throw new Error('Evento não encontrado');
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, ticket[0].userId))
      .limit(1);

    if (!user || user.length === 0) {
      throw new Error('Usuário não encontrado');
    }

    const ticketData = ticket[0];
    const eventData = event[0];
    const userData = user[0];

    if (input.platform === 'ios') {
      const appleWalletUrl = generateAppleWalletUrl({
        ticketId: ticketData.id,
        eventTitle: eventData.title,
        venueName: eventData.venueName,
        venueAddress: eventData.venueAddress,
        eventDate: eventData.date,
        qrCode: ticketData.qrCode,
        userName: userData.name,
        quantity: ticketData.quantity,
        price: ticketData.price,
      });

      return {
        success: true,
        platform: 'ios',
        url: appleWalletUrl,
      };
    } else {
      const googleWalletUrl = generateGoogleWalletUrl({
        ticketId: ticketData.id,
        eventTitle: eventData.title,
        venueName: eventData.venueName,
        venueAddress: eventData.venueAddress,
        eventDate: eventData.date,
        qrCode: ticketData.qrCode,
        userName: userData.name,
        quantity: ticketData.quantity,
        price: ticketData.price,
      });

      return {
        success: true,
        platform: 'android',
        url: googleWalletUrl,
      };
    }
  });

interface PassData {
  ticketId: string;
  eventTitle: string;
  venueName: string;
  venueAddress: string;
  eventDate: string;
  qrCode: string;
  userName: string;
  quantity: number;
  price: number;
}

function generateAppleWalletUrl(data: PassData): string {
  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: 'pass.com.lyven.ticket',
    serialNumber: data.ticketId,
    teamIdentifier: 'LYVEN',
    organizationName: 'Lyven',
    description: `Bilhete para ${data.eventTitle}`,
    logoText: 'Lyven',
    foregroundColor: 'rgb(255, 255, 255)',
    backgroundColor: 'rgb(31, 17, 71)',
    barcode: {
      message: data.qrCode,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1',
    },
    eventTicket: {
      headerFields: [
        {
          key: 'event',
          label: 'EVENTO',
          value: data.eventTitle,
        },
      ],
      primaryFields: [
        {
          key: 'holder',
          label: 'NOME',
          value: data.userName,
        },
      ],
      secondaryFields: [
        {
          key: 'venue',
          label: 'LOCAL',
          value: data.venueName,
        },
        {
          key: 'quantity',
          label: 'QUANTIDADE',
          value: `${data.quantity}x`,
        },
      ],
      auxiliaryFields: [
        {
          key: 'date',
          label: 'DATA',
          value: new Date(data.eventDate).toLocaleDateString('pt-PT'),
        },
        {
          key: 'time',
          label: 'HORA',
          value: new Date(data.eventDate).toLocaleTimeString('pt-PT', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ],
      backFields: [
        {
          key: 'ticketId',
          label: 'ID do Bilhete',
          value: data.ticketId,
        },
        {
          key: 'address',
          label: 'Endereço',
          value: data.venueAddress,
        },
        {
          key: 'price',
          label: 'Preço',
          value: `€${data.price.toFixed(2)}`,
        },
      ],
    },
  };

  const encodedPass = encodeURIComponent(JSON.stringify(passJson));
  return `https://wallet.lyven.app/apple?pass=${encodedPass}`;
}

function generateGoogleWalletUrl(data: PassData): string {
  const passObject = {
    id: `${data.ticketId}`,
    classId: 'lyven_event_ticket',
    state: 'ACTIVE',
    barcode: {
      type: 'QR_CODE',
      value: data.qrCode,
    },
    cardTitle: {
      defaultValue: {
        language: 'pt',
        value: 'Lyven',
      },
    },
    header: {
      defaultValue: {
        language: 'pt',
        value: data.eventTitle,
      },
    },
    subheader: {
      defaultValue: {
        language: 'pt',
        value: data.venueName,
      },
    },
    body: {
      defaultValue: {
        language: 'pt',
        value: data.userName,
      },
    },
    hexBackgroundColor: '#1F1147',
    textModulesData: [
      {
        header: 'QUANTIDADE',
        body: `${data.quantity} bilhete(s)`,
        id: 'quantity',
      },
      {
        header: 'DATA',
        body: new Date(data.eventDate).toLocaleDateString('pt-PT', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        id: 'date',
      },
      {
        header: 'HORA',
        body: new Date(data.eventDate).toLocaleTimeString('pt-PT', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        id: 'time',
      },
      {
        header: 'ENDEREÇO',
        body: data.venueAddress,
        id: 'address',
      },
      {
        header: 'PREÇO',
        body: `€${data.price.toFixed(2)}`,
        id: 'price',
      },
    ],
    linksModuleData: {
      uris: [
        {
          uri: 'https://lyven.app',
          description: 'Visite Lyven',
          id: 'website',
        },
      ],
    },
  };

  const encodedPass = encodeURIComponent(JSON.stringify(passObject));
  return `https://pay.google.com/gp/v/save/${encodedPass}`;
}
