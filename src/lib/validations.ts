import { z } from "zod";

// Schémas de validation pour les formulaires

export const contactFormSchema = z.object({
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Format d'email invalide"),
  telephone: z.string().optional(),
  entreprise: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
  secteur: z.string().optional(),
  typeConsultation: z.string().min(1, "Veuillez sélectionner un type de consultation"),
  budget: z.string().optional(),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
});

export const ticketFormSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  sujet: z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
  message: z.string().min(20, "Le message doit contenir au moins 20 caractères"),
  categorie: z.string().min(1, "Veuillez sélectionner une catégorie"),
  priorite: z.enum(["basse", "normale", "haute", "urgente"], {
    required_error: "Veuillez sélectionner une priorité"
  }),
});

export const leadSchema = z.object({
  first_name: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  last_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Format d'email invalide"),
  phone: z.string().optional(),
  position: z.string().optional(),
  company_id: z.string().uuid().optional(),
  lead_source: z.string().default("website"),
  status: z.enum(["nouveau", "contacte", "qualifie", "converti", "perdu"]).default("nouveau"),
  priority: z.enum(["basse", "normale", "haute", "urgente"]).default("normale"),
  notes: z.string().optional(),
});

export const opportunitySchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().optional(),
  lead_id: z.string().uuid().optional(),
  company_id: z.string().uuid().optional(),
  stage: z.enum(["prospection", "qualification", "proposition", "negociation", "gagne", "perdu"]).default("prospection"),
  probability: z.number().min(0).max(100).default(25),
  estimated_value: z.number().positive().optional(),
  expected_close_date: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const companySchema = z.object({
  name: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
  industry: z.string().optional(),
  size_category: z.enum(["TPE", "PME", "ETI", "GE"]).optional(),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
});

export const userUpdateSchema = z.object({
  full_name: z.string().min(2, "Le nom complet doit contenir au moins 2 caractères").optional(),
  email: z.string().email("Format d'email invalide").optional(),
});

// Types inférés depuis les schémas
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type TicketFormData = z.infer<typeof ticketFormSchema>;
export type LeadData = z.infer<typeof leadSchema>;
export type OpportunityData = z.infer<typeof opportunitySchema>;
export type CompanyData = z.infer<typeof companySchema>;
export type UserUpdateData = z.infer<typeof userUpdateSchema>;