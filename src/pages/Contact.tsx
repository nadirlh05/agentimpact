import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactHeader } from "@/components/contact/ContactHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactInfo } from "@/components/contact/ContactInfo";

const Contact = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ContactHeader />

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Consultation <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Gratuite</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discutons de vos besoins en IA et découvrons ensemble comment transformer votre entreprise.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Formulaire de contact */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Planifier ma consultation
              </CardTitle>
              <p className="text-gray-600">
                Remplissez ce formulaire et nous vous contacterons sous 24h
              </p>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>

          {/* Informations et avantages */}
          <ContactInfo />
        </div>
      </div>
    </div>
  );
};

export default Contact;