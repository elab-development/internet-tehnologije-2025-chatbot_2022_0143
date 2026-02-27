// lib/swagger.ts

export const getSwaggerSpec = () => ({
  openapi: "3.0.0",
  info: {
    title: "Travel Chatbot API",
    version: "1.0.0",
  },
  tags: [
    { name: "Auth", description: "Autentikacija korisnika" },
    { name: "FAQ", description: "Česta pitanja i odgovori" },
  ],
  paths: {
    "/api/auth/login": {
      post: {
        summary: "Prijava korisnika",
        description: "Proverava kredencijale i postavlja httpOnly kolačiće `userId` i `role`.",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "pera@example.com" },
                  password: { type: "string", example: "tajnaLozinka123" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Uspešno logovanje",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 1 },
                        email: { type: "string", format: "email", example: "pera@example.com" },
                        roleName: { type: "string", example: "REGISTROVANI_KORISNIK" },
                      },
                    },
                    roleName: { type: "string", example: "REGISTROVANI_KORISNIK" },
                  },
                },
              },
            },
          },
          400: {
            description: "Nedostaje email ili lozinka",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Email i lozinka su obavezni." },
                  },
                },
              },
            },
          },
          401: {
            description: "Neispravni kredencijali",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Neuspešno logovanje. Proverite kredencijale." },
                  },
                },
              },
            },
          },
          500: {
            description: "Serverska greška",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Serverska greška pri logovanju." },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/auth/me": {
      get: {
        summary: "Vraća informacije o trenutno prijavljenom korisniku",
        description: "Čita httpOnly kolačiće (userId, role) i vraća podatke o korisniku ako je prijavljen.",
        tags: ["Auth"],
        responses: {
          200: {
            description: "Uspešan odgovor (ulogovan ili gost)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: {
                      type: "object",
                      nullable: true,
                      properties: {
                        id: { type: "integer", example: 1 },
                        email: { type: "string", format: "email", example: "pera@example.com" },
                        roleName: { type: "string", example: "ADMIN" },
                      },
                    },
                    roleName: { type: "string", nullable: true, example: "ADMIN" },
                  },
                },
              },
            },
          },
          500: {
            description: "Serverska greška",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Greška na serveru." },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/auth/logout": {
      post: {
        summary: "Odjava korisnika",
        description: "Briše httpOnly kolačiće `userId` i `role`.",
        tags: ["Auth"],
        responses: {
          200: {
            description: "Uspešna odjava",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/faq": {
      get: {
        summary: "Dohvata FAQ pitanja i odgovore",
        description:
          "Ako se pošalje query parametar `limit`, vraća public format (question/answer). Bez `limit` parametra radi u admin list modu i vraća prošireni format.",
        tags: ["FAQ"],
        parameters: [
          {
            in: "query",
            name: "limit",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 50 },
            description: "Broj stavki (ako nije prosleđeno, vraća admin format bez limita)",
          },
        ],
        responses: {
          200: {
            description: "Lista FAQ stavki (public ili admin format)",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer", example: 10 },
                      question: { type: "string", example: "Koji grad u Evropi je najbolji za vikend?" },
                      answer: { type: "string", example: "Prag, Budimpešta i Beč su odlični izbori." },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Greška na serveru",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Greška pri učitavanju pitanja i odgovora." },
                  },
                },
              },
            },
          },
        },
      },

      post: {
        summary: "Kreira novo FAQ pitanje i odgovor (ADMIN)",
        description: "Samo ADMIN može da kreira FAQ. Kreiranje se radi u transakciji (Question + Answer).",
        tags: ["FAQ"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["questionText", "answerText"],
                properties: {
                  questionText: { type: "string", example: "Šta poneti na put u planine zimi?" },
                  answerText: { type: "string", example: "Topla odeća u slojevima, kapa, rukavice, termos." },
                  keywords: { type: "string", nullable: true, example: "planine, zima, oprema" },
                  category: { type: "string", nullable: true, example: "Oprema" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Kreirano FAQ pitanje i odgovor",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "integer", example: 11 },
                    questionText: { type: "string", example: "Šta poneti na put u planine zimi?" },
                    answerText: { type: "string", example: "Topla odeća u slojevima, kapa, rukavice, termos." },
                    keywords: { type: "string", nullable: true, example: "planine, zima, oprema" },
                    category: { type: "string", nullable: true, example: "Oprema" },
                  },
                },
              },
            },
          },
          400: {
            description: "Pitanje i odgovor su obavezni",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Pitanje i odgovor su obavezni." },
                  },
                },
              },
            },
          },
          403: {
            description: "Nema dozvolu (nije ADMIN)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Samo admin može da upravlja pitanjima i odgovorima." },
                  },
                },
              },
            },
          },
          500: {
            description: "Greška na serveru",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Greška pri kreiranju pitanja i odgovora." },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {},
});