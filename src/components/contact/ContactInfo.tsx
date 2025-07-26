import { Mail, MessageCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ContactInfo = () => {
  return (
    <div className="space-y-8">
      {/* Contact direct */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            Contact Direct
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-gray-600">nadir.lahyani@outlook.fr</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium">WhatsApp</p>
              <p className="text-gray-600">+33768474681</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ce que vous obtiendrez */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            Ce que vous obtiendrez
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              "Analyse gratuite de vos processus actuels",
              "Identification des opportunités d'automatisation",
              "Estimation de ROI personnalisée",
              "Roadmap d'implémentation détaillée",
              "Démonstration de solutions similaires"
            ].map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Processus */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            Déroulement de la consultation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: "1", title: "Prise de contact", desc: "Sous 24h par email ou téléphone" },
              { step: "2", title: "Consultation", desc: "45-60 min par visio ou téléphone" },
              { step: "3", title: "Proposition", desc: "Devis détaillé sous 48h" }
            ].map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {step.step}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{step.title}</p>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};