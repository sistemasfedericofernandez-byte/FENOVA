import type { Metadata } from "next";
import { TERMS_VERSION } from "@/lib/terms";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y Condiciones de uso de PropiMarket, la plataforma de gestión y publicación inmobiliaria.",
};

const SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: "1. Quiénes somos y qué es PropiMarket",
    paragraphs: [
      'PropiMarket (en adelante, "la Plataforma" o "el Sistema") es un servicio de software (SaaS) operado bajo el dominio propimarket.com.ar, que ofrece a inmobiliarias, hoteles y propietarios directos (en adelante, "el Usuario" o "la Cuenta") herramientas para publicar propiedades y hospedajes, y para llevar su propia gestión interna: propietarios, inquilinos, contratos de alquiler y seguimiento de pagos.',
      "PropiMarket no es una inmobiliaria, no es agente inmobiliario, no es martillero ni corredor público, y no participa como parte en ninguna operación de venta, alquiler o reserva. La Plataforma es exclusivamente una herramienta tecnológica que el Usuario utiliza bajo su propia responsabilidad para gestionar su actividad.",
    ],
  },
  {
    title: "2. Aceptación de estos términos",
    paragraphs: [
      "El uso de la Plataforma implica la aceptación plena de estos Términos y Condiciones. Si el Usuario no está de acuerdo con alguna parte de este documento, debe abstenerse de registrarse o utilizar el Sistema.",
      "Al crear una cuenta, el Usuario tilda expresamente la casilla de aceptación de estos Términos y Condiciones, y el Sistema registra la fecha, hora y versión del documento aceptada, como constancia de dicha conformidad.",
    ],
  },
  {
    title: "3. PropiMarket no gestiona ni administra propiedades",
    paragraphs: [
      "PropiMarket no gestiona, administra, intermedia ni supervisa las propiedades, alquileres, ventas ni reservas que los Usuarios publican o registran en el Sistema. Toda la gestión —publicación de inmuebles, carga de propietarios, inquilinos, garantes, montos, contratos y registro de pagos— es realizada exclusivamente por el propio Usuario, bajo su exclusiva responsabilidad.",
      "El Usuario reconoce que es el único responsable de la veracidad, exactitud, legalidad y actualización de los datos que carga en el Sistema, incluyendo pero no limitado a: descripciones de propiedades, precios, condiciones de alquiler, y datos personales de propietarios, inquilinos y garantes (nombre, DNI/CUIT, teléfono, email y cualquier otro dato).",
      "PropiMarket no verifica ni garantiza la identidad de las personas cuyos datos son cargados por el Usuario, ni la existencia, titularidad o estado legal de las propiedades publicadas.",
    ],
  },
  {
    title: "4. PropiMarket no interviene en el dinero de los alquileres",
    paragraphs: [
      "PropiMarket no cobra, no recibe, no retiene ni transfiere dinero correspondiente a alquileres, señas, depósitos, expensas ni ningún otro concepto vinculado a las operaciones inmobiliarias entre el Usuario y sus propietarios, inquilinos o clientes. Ningún inquilino, propietario o tercero realiza pagos de ningún tipo a PropiMarket ni a través de PropiMarket.",
      'El módulo de "pagos de alquiler" del Sistema es exclusivamente un registro manual que el Usuario completa por su cuenta (marcar un mes como "pagado" o "pendiente"); no constituye un medio de pago, no procesa transacciones, no emite comprobantes con validez fiscal y no genera ninguna obligación ni responsabilidad para PropiMarket respecto de esos cobros.',
      "El único cobro que realiza PropiMarket es el de su propia tarifa de suscripción por el uso del Sistema, cobrada directamente al Usuario (la inmobiliaria, hotel o propietario directo) mediante débito automático a través de Mercado Pago. Este cobro es exclusivamente por el servicio de software prestado por PropiMarket, y es independiente y ajeno a cualquier transacción entre el Usuario y sus propios clientes.",
    ],
  },
  {
    title: "5. Responsabilidad sobre el contenido publicado",
    paragraphs: [
      "El Usuario es el único responsable por el contenido que publica en la Plataforma (textos, fotos, precios, datos de contacto y cualquier otro material), y garantiza que cuenta con los derechos y autorizaciones necesarios para publicarlo, incluida la autorización de propietarios, inquilinos y garantes para el tratamiento de sus datos personales dentro del Sistema.",
      "PropiMarket podrá remover, ocultar o suspender publicaciones o cuentas que incumplan la ley, estos Términos, o que sean denunciadas por terceros, sin que ello genere derecho a indemnización alguna a favor del Usuario.",
    ],
  },
  {
    title: "6. Datos personales de terceros (inquilinos, propietarios, garantes)",
    paragraphs: [
      "El Usuario actúa como responsable del tratamiento de los datos personales de terceros (propietarios, inquilinos, garantes) que carga en el Sistema, en los términos de la Ley 25.326 de Protección de Datos Personales, y declara contar con el consentimiento o la base legal necesaria para tratar esos datos dentro de una herramienta de gestión como PropiMarket.",
      "PropiMarket actúa, respecto de esos datos de terceros, como encargado del tratamiento: los almacena y procesa únicamente para prestar el servicio de software al Usuario, no los utiliza con fines propios, no los vende ni los cede a terceros, y aplica medidas de seguridad razonables acordes al estado de la técnica para protegerlos.",
      "Ante cualquier solicitud de acceso, rectificación o supresión de datos personales por parte de un propietario, inquilino o garante, dicha solicitud debe canalizarse a través del Usuario (la inmobiliaria), quien es el responsable directo frente al titular de los datos.",
    ],
  },
  {
    title: "7. Seguridad y límite de responsabilidad ante incidentes",
    paragraphs: [
      "PropiMarket implementa medidas de seguridad razonables para proteger la información almacenada en el Sistema. Sin embargo, ningún sistema informático es absolutamente inviolable, y el Usuario reconoce y acepta que el uso de la Plataforma conlleva riesgos inherentes a cualquier servicio en internet.",
      "En la máxima medida permitida por la legislación aplicable, PropiMarket no será responsable por daños indirectos, lucro cesante, pérdida de datos, ni por accesos no autorizados, filtraciones o hackeos que no deriven de negligencia grave o dolo comprobado de PropiMarket, y en ningún caso responderá por conflictos, incumplimientos contractuales, falta de pago o daños que surjan entre el Usuario y sus propios inquilinos, propietarios o clientes.",
      "Ante un incidente de seguridad que afecte datos personales, PropiMarket notificará al Usuario afectado dentro de un plazo razonable, conforme a las buenas prácticas y a la normativa vigente en materia de protección de datos.",
    ],
  },
  {
    title: "8. Suscripción y facturación",
    paragraphs: [
      "El acceso a determinadas funcionalidades del Sistema requiere una suscripción paga, cobrada mediante débito automático a través de Mercado Pago, con la periodicidad y el monto informados al momento de la contratación del plan.",
      "El Usuario puede cancelar su suscripción en cualquier momento desde su panel; la cancelación tiene efecto a partir del próximo período de facturación, sin reintegro proporcional del período en curso, salvo que la normativa de defensa del consumidor aplicable disponga lo contrario.",
      "La falta de pago de la suscripción puede derivar en la suspensión o despublicación automática de los anuncios y funcionalidades del Usuario, sin que ello genere responsabilidad para PropiMarket por eventuales pérdidas comerciales derivadas de dicha suspensión.",
    ],
  },
  {
    title: "9. Uso aceptable de la Plataforma",
    paragraphs: [
      "El Usuario se compromete a utilizar el Sistema de buena fe, sin publicar contenido falso, engañoso, discriminatorio o ilegal, y sin utilizar la Plataforma para fines distintos a la publicación y gestión de propiedades y hospedajes reales.",
      "Queda prohibido intentar vulnerar la seguridad del Sistema, acceder a datos de otras cuentas, o utilizar la Plataforma para actividades fraudulentas. El incumplimiento habilita a PropiMarket a suspender o dar de baja la cuenta, sin perjuicio de las acciones legales que correspondan.",
    ],
  },
  {
    title: "10. Propiedad intelectual",
    paragraphs: [
      "El software, diseño, marca PropiMarket y demás elementos de la Plataforma son propiedad de PropiMarket o de sus licenciantes. El Usuario conserva la titularidad del contenido que carga (textos, fotos, datos), y otorga a PropiMarket una licencia limitada para almacenarlo, procesarlo y mostrarlo exclusivamente en el marco de la prestación del servicio.",
    ],
  },
  {
    title: "11. Modificaciones a estos Términos",
    paragraphs: [
      "PropiMarket podrá modificar estos Términos y Condiciones en cualquier momento. Los cambios relevantes serán notificados a los Usuarios por los medios habituales de contacto, y el uso continuado de la Plataforma luego de dicha notificación implica la aceptación de los nuevos términos. Cuando el cambio sea sustancial, se podrá solicitar una nueva aceptación expresa.",
    ],
  },
  {
    title: "12. Legislación aplicable y jurisdicción",
    paragraphs: [
      "Estos Términos y Condiciones se rigen por las leyes de la República Argentina. Para cualquier controversia derivada del uso de la Plataforma, las partes se someten a la jurisdicción de los tribunales ordinarios de la Provincia de Corrientes, Argentina, con renuncia a cualquier otro fuero que pudiera corresponder.",
    ],
  },
  {
    title: "13. Contacto",
    paragraphs: [
      "Ante cualquier consulta sobre estos Términos y Condiciones, el Usuario puede contactar a PropiMarket a través de los canales de contacto informados en el sitio.",
    ],
  },
];

export default function TerminosPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Términos y Condiciones</h1>
        <p className="text-sm text-zinc-500">
          Versión {TERMS_VERSION} · PropiMarket ({"propimarket.com.ar"})
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {SECTIONS.map((section) => (
          <section key={section.title} className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
