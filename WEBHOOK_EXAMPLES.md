# 📋 Exemplos de Integração - Webhook de Eventos

Este documento contém exemplos práticos de diferentes tipos de eventos e cenários de uso.

---

## 🎵 Exemplo 1: Concerto de Rock

```json
{
  "apiKey": "sua-api-key",
  "event": {
    "title": "Concerto Rock in Rio Lisboa",
    "description": "O maior festival de rock volta a Lisboa! Três dias de música com os melhores artistas nacionais e internacionais.",
    "category": "music",
    "date": "2025-06-20T18:00:00Z",
    "endDate": "2025-06-23T03:00:00Z",
    "duration": 540,
    
    "venue": {
      "name": "Parque da Bela Vista",
      "address": "Avenida Marechal Gomes da Costa",
      "city": "Lisboa",
      "capacity": 80000,
      "latitude": 38.7436,
      "longitude": -9.1119
    },
    
    "images": {
      "cover": "https://seusite.com/eventos/rock-in-rio-2025.jpg"
    },
    
    "promoter": {
      "name": "Rock World",
      "image": "https://seusite.com/promoters/rockworld-logo.jpg",
      "description": "Organizadores dos maiores festivais de música em Portugal"
    },
    
    "artists": [
      {
        "name": "Metallica",
        "genre": "Metal",
        "image": "https://seusite.com/artists/metallica.jpg"
      },
      {
        "name": "Foo Fighters",
        "genre": "Rock",
        "image": "https://seusite.com/artists/foofighters.jpg"
      },
      {
        "name": "The Offspring",
        "genre": "Punk Rock",
        "image": "https://seusite.com/artists/offspring.jpg"
      }
    ],
    
    "ticketTypes": [
      {
        "name": "Early Bird - Passe 3 Dias",
        "price": 149.00,
        "available": 10000,
        "description": "Acesso aos 3 dias do festival com desconto especial",
        "maxPerPerson": 4
      },
      {
        "name": "Passe 3 Dias",
        "price": 189.00,
        "available": 50000,
        "description": "Acesso completo aos 3 dias do festival",
        "maxPerPerson": 10
      },
      {
        "name": "Bilhete Diário",
        "price": 79.00,
        "available": 15000,
        "description": "Acesso a 1 dia do festival",
        "maxPerPerson": 8
      },
      {
        "name": "VIP 3 Dias",
        "price": 399.00,
        "available": 2000,
        "description": "Área VIP com catering, bar privado e acesso backstage",
        "maxPerPerson": 2
      }
    ],
    
    "tags": ["rock", "festival", "outdoor", "multidia", "internacional"],
    
    "socialLinks": {
      "instagram": "https://instagram.com/rockinrio",
      "facebook": "https://facebook.com/rockinriolisboa",
      "twitter": "https://twitter.com/rockinrio",
      "website": "https://www.rockinriolisboa.pt"
    },
    
    "isFeatured": true
  }
}
```

---

## 🎭 Exemplo 2: Peça de Teatro

```json
{
  "apiKey": "sua-api-key",
  "event": {
    "title": "O Mercador de Veneza",
    "description": "Clássico de Shakespeare numa interpretação moderna e envolvente. Uma história atemporal sobre justiça, misericórdia e preconceito.",
    "category": "theater",
    "date": "2025-03-10T21:00:00Z",
    "duration": 150,
    
    "venue": {
      "name": "Teatro Nacional D. Maria II",
      "address": "Praça Dom Pedro IV",
      "city": "Lisboa",
      "capacity": 650,
      "latitude": 38.7139,
      "longitude": -9.1395
    },
    
    "images": {
      "cover": "https://seusite.com/eventos/mercador-veneza.jpg"
    },
    
    "promoter": {
      "name": "Teatro Nacional",
      "image": "https://seusite.com/promoters/teatro-nacional.jpg",
      "description": "Produção teatral de excelência desde 1846"
    },
    
    "ticketTypes": [
      {
        "name": "Plateia",
        "price": 25.00,
        "available": 400,
        "description": "Lugares na plateia",
        "maxPerPerson": 6
      },
      {
        "name": "Balcão",
        "price": 18.00,
        "available": 200,
        "description": "Lugares no balcão",
        "maxPerPerson": 6
      },
      {
        "name": "Estudante",
        "price": 12.00,
        "available": 50,
        "description": "Desconto para estudantes (apresentar cartão à entrada)",
        "maxPerPerson": 2
      }
    ],
    
    "tags": ["shakespeare", "teatro", "drama", "clássico"],
    
    "socialLinks": {
      "facebook": "https://facebook.com/teatronacional",
      "instagram": "https://instagram.com/teatronacional"
    },
    
    "isFeatured": false
  }
}
```

---

## 😂 Exemplo 3: Stand-Up Comedy

```json
{
  "apiKey": "sua-api-key",
  "event": {
    "title": "Ricardo Araújo Pereira - Tour 2025",
    "description": "O humorista português mais aclamado está de volta com um novo espetáculo cheio de humor inteligente e observações hilariantes sobre a sociedade portuguesa.",
    "category": "comedy",
    "date": "2025-04-15T22:00:00Z",
    "duration": 90,
    
    "venue": {
      "name": "Coliseu do Porto",
      "address": "Rua de Passos Manuel 137",
      "city": "Porto",
      "capacity": 3000,
      "latitude": 41.1496,
      "longitude": -8.6109
    },
    
    "images": {
      "cover": "https://seusite.com/eventos/rap-comedy-tour.jpg"
    },
    
    "promoter": {
      "name": "Comedy Central PT",
      "image": "https://seusite.com/promoters/comedy-central.jpg",
      "description": "Os melhores espetáculos de comédia em Portugal"
    },
    
    "artists": [
      {
        "name": "Ricardo Araújo Pereira",
        "genre": "Stand-Up Comedy",
        "image": "https://seusite.com/artists/rap.jpg"
      }
    ],
    
    "ticketTypes": [
      {
        "name": "1º Lote",
        "price": 20.00,
        "available": 1000,
        "description": "Primeiro lote com desconto",
        "maxPerPerson": 4
      },
      {
        "name": "2º Lote",
        "price": 25.00,
        "available": 1500,
        "description": "Preço normal",
        "maxPerPerson": 6
      },
      {
        "name": "VIP Meet & Greet",
        "price": 75.00,
        "available": 50,
        "description": "Bilhete + encontro com o artista após o espetáculo",
        "maxPerPerson": 2
      }
    ],
    
    "tags": ["comédia", "stand-up", "humor", "português"],
    
    "socialLinks": {
      "instagram": "https://instagram.com/ricardoaraujopereira"
    },
    
    "isFeatured": true
  }
}
```

---

## 🎪 Exemplo 4: Festival Gratuito

```json
{
  "apiKey": "sua-api-key",
  "event": {
    "title": "Festa da Música - Dia Europeu da Música",
    "description": "Celebração gratuita com concertos ao ar livre em vários palcos pela cidade. Música para todos os gostos!",
    "category": "festival",
    "date": "2025-06-21T15:00:00Z",
    "endDate": "2025-06-22T02:00:00Z",
    
    "venue": {
      "name": "Centro Histórico do Porto",
      "address": "Várias localizações no centro",
      "city": "Porto",
      "capacity": 50000,
      "latitude": 41.1579,
      "longitude": -8.6291
    },
    
    "images": {
      "cover": "https://seusite.com/eventos/festa-musica.jpg"
    },
    
    "promoter": {
      "name": "Câmara Municipal do Porto",
      "image": "https://seusite.com/promoters/cm-porto.jpg",
      "description": "Eventos culturais promovidos pela cidade do Porto"
    },
    
    "ticketTypes": [
      {
        "name": "Entrada Gratuita",
        "price": 0,
        "available": 50000,
        "description": "Acesso livre a todos os palcos",
        "maxPerPerson": 10
      }
    ],
    
    "tags": ["gratuito", "festival", "música", "outdoor", "porto"],
    
    "socialLinks": {
      "facebook": "https://facebook.com/cmporto",
      "instagram": "https://instagram.com/municipiodoporto",
      "website": "https://www.cm-porto.pt"
    },
    
    "isFeatured": true
  }
}
```

---

## 💃 Exemplo 5: Espetáculo de Dança

```json
{
  "apiKey": "sua-api-key",
  "event": {
    "title": "Ballet Cisne Negro",
    "description": "Uma reinterpretação contemporânea do clássico ballet O Lago dos Cisnes pela companhia nacional de dança.",
    "category": "dance",
    "date": "2025-05-08T20:00:00Z",
    "duration": 120,
    
    "venue": {
      "name": "Centro Cultural de Belém",
      "address": "Praça do Império",
      "city": "Lisboa",
      "capacity": 1400,
      "latitude": 38.6969,
      "longitude": -9.2076
    },
    
    "images": {
      "cover": "https://seusite.com/eventos/cisne-negro.jpg"
    },
    
    "promoter": {
      "name": "Companhia Nacional de Bailado",
      "image": "https://seusite.com/promoters/cnb.jpg",
      "description": "Excelência na dança clássica e contemporânea"
    },
    
    "ticketTypes": [
      {
        "name": "Plateia Central",
        "price": 45.00,
        "available": 600,
        "description": "Melhores lugares na plateia central",
        "maxPerPerson": 4
      },
      {
        "name": "Plateia Lateral",
        "price": 35.00,
        "available": 500,
        "description": "Lugares na plateia lateral",
        "maxPerPerson": 4
      },
      {
        "name": "Balcão",
        "price": 25.00,
        "available": 300,
        "description": "Lugares no balcão",
        "maxPerPerson": 6
      },
      {
        "name": "Estudante/Senior",
        "price": 15.00,
        "available": 100,
        "description": "Desconto para estudantes e seniores",
        "maxPerPerson": 2
      }
    ],
    
    "tags": ["ballet", "dança", "clássico", "contemporâneo"],
    
    "socialLinks": {
      "instagram": "https://instagram.com/cnbailado",
      "website": "https://www.cnb.pt"
    },
    
    "isFeatured": false
  }
}
```

---

## 🎸 Exemplo 6: Concerto Intimista

```json
{
  "apiKey": "sua-api-key",
  "event": {
    "title": "Ana Moura - Concerto Acústico",
    "description": "Experiência única e intimista com a fadista portuguesa em formato acústico. Repertório especial com os maiores sucessos.",
    "category": "music",
    "date": "2025-09-12T21:30:00Z",
    "duration": 90,
    
    "venue": {
      "name": "Casa da Música",
      "address": "Avenida da Boavista 604-610",
      "city": "Porto",
      "capacity": 300,
      "latitude": 41.1586,
      "longitude": -8.6300
    },
    
    "images": {
      "cover": "https://seusite.com/eventos/ana-moura-acustico.jpg"
    },
    
    "promoter": {
      "name": "Fado Productions",
      "image": "https://seusite.com/promoters/fado-prod.jpg",
      "description": "Promotores de música portuguesa tradicional"
    },
    
    "artists": [
      {
        "name": "Ana Moura",
        "genre": "Fado",
        "image": "https://seusite.com/artists/ana-moura.jpg"
      }
    ],
    
    "ticketTypes": [
      {
        "name": "Premium",
        "price": 65.00,
        "available": 100,
        "description": "Primeiras filas, taça de vinho incluída",
        "maxPerPerson": 2
      },
      {
        "name": "Normal",
        "price": 45.00,
        "available": 200,
        "description": "Lugares standard",
        "maxPerPerson": 4
      }
    ],
    
    "tags": ["fado", "acústico", "português", "intimista"],
    
    "socialLinks": {
      "instagram": "https://instagram.com/anamouraoficial"
    },
    
    "isFeatured": true
  }
}
```

---

## 🎊 Exemplo 7: Festival Multi-Género

```json
{
  "apiKey": "sua-api-key",
  "event": {
    "title": "NOS Alive 2025",
    "description": "O maior festival multi-género de Portugal com artistas de rock, pop, indie, electrónica e hip-hop.",
    "category": "festival",
    "date": "2025-07-10T17:00:00Z",
    "endDate": "2025-07-13T04:00:00Z",
    
    "venue": {
      "name": "Passeio Marítimo de Algés",
      "address": "Avenida Marginal",
      "city": "Oeiras",
      "capacity": 55000,
      "latitude": 38.6931,
      "longitude": -9.2348
    },
    
    "images": {
      "cover": "https://seusite.com/eventos/nos-alive-2025.jpg"
    },
    
    "promoter": {
      "name": "Everything is New",
      "image": "https://seusite.com/promoters/ein.jpg",
      "description": "Organizadores de grandes festivais em Portugal"
    },
    
    "artists": [
      {
        "name": "Arctic Monkeys",
        "genre": "Indie Rock",
        "image": "https://seusite.com/artists/arctic-monkeys.jpg"
      },
      {
        "name": "Billie Eilish",
        "genre": "Pop",
        "image": "https://seusite.com/artists/billie.jpg"
      },
      {
        "name": "The Chemical Brothers",
        "genre": "Electronic",
        "image": "https://seusite.com/artists/chemical.jpg"
      }
    ],
    
    "ticketTypes": [
      {
        "name": "Early Bird - Passe Geral",
        "price": 139.00,
        "available": 5000,
        "description": "Desconto antecipado para os 3 dias",
        "maxPerPerson": 4
      },
      {
        "name": "Passe Geral",
        "price": 169.00,
        "available": 35000,
        "description": "Acesso aos 3 dias do festival",
        "maxPerPerson": 8
      },
      {
        "name": "Bilhete Diário",
        "price": 69.00,
        "available": 10000,
        "description": "Acesso a 1 dia à escolha",
        "maxPerPerson": 6
      },
      {
        "name": "VIP Experience",
        "price": 449.00,
        "available": 1000,
        "description": "Área VIP, bar exclusivo, backstage tours",
        "maxPerPerson": 2
      },
      {
        "name": "Camping + Passe",
        "price": 229.00,
        "available": 3000,
        "description": "Passe 3 dias + acesso ao camping",
        "maxPerPerson": 4
      }
    ],
    
    "tags": ["festival", "rock", "pop", "electrónica", "outdoor", "verão"],
    
    "socialLinks": {
      "instagram": "https://instagram.com/nosalive",
      "facebook": "https://facebook.com/nosalive",
      "twitter": "https://twitter.com/nosalive",
      "website": "https://www.nosalive.com"
    },
    
    "isFeatured": true
  }
}
```

---

## 💡 Dicas de Integração

### Gestão de Preços
- Use sempre 2 casas decimais para preços (ex: 25.00)
- Para eventos gratuitos, use `price: 0`
- Considere diferentes lotes de preços (Early Bird, Normal, Last Minute)

### Quantidades
- Defina `available` baseado na capacidade real
- Para eventos gratuitos, ainda assim defina um limite
- Use `maxPerPerson` para controlar compras individuais

### Categorias
Escolha a categoria mais adequada:
- `music` - Concertos, festivais musicais
- `theater` - Teatro, ópera
- `comedy` - Stand-up, humor
- `dance` - Ballet, dança contemporânea
- `festival` - Festivais multi-género
- `other` - Outros tipos de eventos

### Tags
Use tags relevantes para melhorar a descoberta:
- Género musical: "rock", "pop", "fado", "jazz"
- Local: "outdoor", "indoor", "praia", "parque"
- Tipo: "gratuito", "familiar", "vip"
- Características: "multidia", "camping", "português"

### Coordenadas
- Sempre que possível, inclua latitude/longitude
- Usa para mostrar eventos no mapa da app
- Ajuda na busca por proximidade

---

## 🔄 Atualização de Eventos

Para atualizar um evento existente, contacte o suporte técnico. 
Futuramente será implementado um endpoint para atualização.

---

**Nota:** Todos os exemplos usam dados fictícios para fins demonstrativos.
