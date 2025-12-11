import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConsultationRequest {
  nom: string;
  prenom: string;
  email: string;
  entreprise: string;
  secteur?: string;
  typeConsultation?: string;
  budget?: string;
  message: string;
  telephone?: string;
}

// Mask PII for logging
const maskEmail = (email: string): string => {
  const [user, domain] = email.split('@');
  return `${user[0]}***@${domain}`;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Rate limiting check using Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
      _identifier: clientIP,
      _endpoint: 'contact-consultation',
      _max_requests: 5,
      _window_minutes: 60
    });

    if (!rateLimitOk) {
      console.log(`Rate limit exceeded for IP: ${clientIP.substring(0, 8)}***`);
      return new Response(
        JSON.stringify({ error: 'Trop de demandes. Veuillez réessayer plus tard.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Vérifier que la clé API Resend est disponible
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY n'est pas configurée");
      throw new Error("Configuration email manquante");
    }
    
    const resend = new Resend(resendApiKey);
    
    const formData: ConsultationRequest = await req.json();
    
    // Input validation and sanitization
    if (!formData.nom || !formData.prenom || !formData.email || !formData.message) {
      return new Response(JSON.stringify({ 
        error: "Champs requis manquants: nom, prénom, email et message sont obligatoires" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return new Response(JSON.stringify({ 
        error: "Format d'email invalide" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    // Sanitize input data
    const sanitizedData = {
      nom: formData.nom.trim().substring(0, 100),
      prenom: formData.prenom.trim().substring(0, 100),
      email: formData.email.trim().toLowerCase().substring(0, 254),
      entreprise: formData.entreprise?.trim().substring(0, 200) || '',
      secteur: formData.secteur?.trim().substring(0, 100) || '',
      typeConsultation: formData.typeConsultation?.trim().substring(0, 100) || '',
      budget: formData.budget?.trim().substring(0, 50) || '',
      message: formData.message.trim().substring(0, 2000),
      telephone: formData.telephone?.trim().substring(0, 20) || ''
    };
    
    // Log with masked PII
    console.log("Nouvelle demande de consultation reçue:", {
      prenom: sanitizedData.prenom[0] + '***',
      nom: sanitizedData.nom[0] + '***',
      email: maskEmail(sanitizedData.email),
      entreprise: sanitizedData.entreprise,
      timestamp: new Date().toISOString()
    });

    // Email vers l'admin (vous)
    const adminEmailResponse = await resend.emails.send({
      from: "AgentImpact <onboarding@resend.dev>",
      to: ["nadir.lahyani@outlook.fr"], // Votre email
      subject: `🚀 Nouvelle demande de consultation - ${sanitizedData.entreprise || 'Entreprise'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6; border-bottom: 2px solid #3B82F6; padding-bottom: 10px;">
            Nouvelle Demande de Consultation
          </h1>
          
          <div style="background-color: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1E40AF; margin-top: 0;">Informations du Contact</h2>
            <p><strong>Nom :</strong> ${sanitizedData.prenom} ${sanitizedData.nom}</p>
            <p><strong>Email :</strong> <a href="mailto:${sanitizedData.email}">${sanitizedData.email}</a></p>
            <p><strong>Téléphone :</strong> ${sanitizedData.telephone || 'Non renseigné'}</p>
            <p><strong>Entreprise :</strong> ${sanitizedData.entreprise}</p>
            <p><strong>Secteur :</strong> ${sanitizedData.secteur || 'Non spécifié'}</p>
          </div>

          <div style="background-color: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1E40AF; margin-top: 0;">Détails de la Demande</h2>
            <p><strong>Type de consultation :</strong> ${sanitizedData.typeConsultation || 'Non spécifié'}</p>
            <p><strong>Budget approximatif :</strong> ${sanitizedData.budget || 'Non défini'}</p>
          </div>

          <div style="background-color: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #16A34A; margin-top: 0;">Message</h2>
            <p style="white-space: pre-wrap;">${sanitizedData.message}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 14px;">
              <strong>Actions à prendre :</strong><br>
              • Répondre sous 24h pour la consultation gratuite<br>
              • Ajouter le contact au CRM<br>
              • Préparer une proposition personnalisée
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="mailto:${sanitizedData.email}?subject=Re: Consultation gratuite - AgenceImpact.com" 
               style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Répondre par Email
            </a>
          </div>
        </div>
      `,
    });

    // Email de confirmation au client
    const clientEmailResponse = await resend.emails.send({
      from: "AgentImpact <onboarding@resend.dev>",
      to: [sanitizedData.email],
      subject: "Confirmation de votre demande de consultation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6; border-bottom: 2px solid #3B82F6; padding-bottom: 10px;">
            Merci pour votre demande de consultation !
          </h1>
          
          <p>Bonjour ${sanitizedData.prenom},</p>
          
          <p>Nous avons bien reçu votre demande de consultation gratuite pour <strong>${sanitizedData.entreprise}</strong>.</p>
          
          <div style="background-color: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1E40AF; margin-top: 0;">Prochaines étapes</h2>
            <ul style="color: #374151;">
              <li>Nous vous contacterons sous <strong>24 heures</strong></li>
              <li>Consultation gratuite de <strong>45-60 minutes</strong></li>
              <li>Analyse personnalisée de vos besoins</li>
              <li>Proposition détaillée sous 48h</li>
            </ul>
          </div>

          <div style="background-color: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #16A34A; margin-top: 0;">Récapitulatif de votre demande</h2>
            <p><strong>Type de consultation :</strong> ${sanitizedData.typeConsultation || 'Découverte IA'}</p>
            <p><strong>Secteur :</strong> ${sanitizedData.secteur || 'Non spécifié'}</p>
            <p><strong>Budget :</strong> ${sanitizedData.budget || 'À définir'}</p>
          </div>

          <p>En attendant notre contact, n'hésitez pas à consulter nos <a href="https://votre-domaine.com/services" style="color: #3B82F6;">services</a> pour mieux comprendre nos solutions IA.</p>
          
          <p>À très bientôt !<br>
          <strong>L'équipe AgenceImpact.com</strong></p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 12px;">
            <p>AgenceImpact.com - Expert en Intelligence Artificielle<br>
            Email: nadir.lahyani@outlook.fr</p>
          </div>
        </div>
      `,
    });

    console.log("Emails envoyés avec succès");

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Demande envoyée avec succès" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erreur dans contact-consultation function:", error.message);
    return new Response(
      JSON.stringify({ 
        error: "Erreur lors de l'envoi", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
