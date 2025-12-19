// components/TermsOfService.jsx
import React from 'react';

const TermsOfService = ({ onBack }) => {
  return (
    <div className="rey-premium-layout min-h-screen">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <header className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="text-[#D4A574] hover:text-[#E6C589] transition-colors mr-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-[#D4A574] font-['Tilt_Warp']">
            Términos y Condiciones
          </h1>
        </header>

        {/* Content */}
        <div className="prose prose-invert max-w-none text-[#F5DEB3] space-y-6">
          <p className="text-sm opacity-70">
            Última actualización: {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">1. Aceptación de los Términos</h2>
            <p>
              Al descargar, instalar o usar <strong>Rey del Truco</strong> ("la App"),
              aceptás estos Términos y Condiciones de uso. Si no estás de acuerdo con
              estos términos, por favor no uses la App.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">2. Descripción del Servicio</h2>
            <p>
              Rey del Truco es una aplicación móvil y web que funciona como anotador
              digital para el juego de cartas Truco. La App permite:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Llevar el puntaje de las partidas de Truco</li>
              <li>Guardar historial de partidas</li>
              <li>Ver estadísticas de juego (con cuenta)</li>
              <li>Sincronizar datos entre dispositivos (con cuenta)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">3. Cuentas de Usuario</h2>
            <p>
              <strong>Uso sin cuenta:</strong> Podés usar la App sin crear una cuenta.
              En este caso, los datos se guardan localmente en tu dispositivo.
            </p>
            <p className="mt-3">
              <strong>Uso con cuenta:</strong> Al crear una cuenta, sos responsable de:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Mantener la confidencialidad de tus credenciales</li>
              <li>Todas las actividades que ocurran bajo tu cuenta</li>
              <li>Notificarnos inmediatamente si sospechás uso no autorizado</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">4. Uso Aceptable</h2>
            <p>Al usar la App, te comprometés a NO:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Usar la App para fines ilegales</li>
              <li>Intentar acceder a cuentas de otros usuarios</li>
              <li>Interferir con el funcionamiento de la App o sus servidores</li>
              <li>Realizar ingeniería inversa del código de la App</li>
              <li>Usar bots o sistemas automatizados para manipular datos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">5. Propiedad Intelectual</h2>
            <p>
              La App, incluyendo su diseño, código, gráficos, y contenido, es propiedad
              de Rey del Truco y está protegida por leyes de propiedad intelectual.
              No podés copiar, modificar, distribuir, o crear obras derivadas sin
              autorización expresa.
            </p>
            <p className="mt-3">
              El juego de Truco es patrimonio cultural y no reclamamos propiedad sobre
              sus reglas tradicionales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">6. Disponibilidad del Servicio</h2>
            <p>
              Nos esforzamos por mantener la App disponible, pero no garantizamos
              disponibilidad ininterrumpida. La App puede no estar disponible por:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Mantenimiento programado o de emergencia</li>
              <li>Problemas técnicos fuera de nuestro control</li>
              <li>Actualizaciones del sistema</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">7. Limitación de Responsabilidad</h2>
            <p>
              La App se proporciona "tal cual" y "según disponibilidad".
              No garantizamos que la App será libre de errores o que cumplirá
              con tus expectativas específicas.
            </p>
            <p className="mt-3">
              En la máxima medida permitida por la ley, no seremos responsables por:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Pérdida de datos</li>
              <li>Daños indirectos o consecuentes</li>
              <li>Interrupciones del servicio</li>
              <li>Disputas relacionadas con partidas de Truco</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">8. Modificaciones al Servicio</h2>
            <p>
              Nos reservamos el derecho de modificar, suspender o discontinuar
              cualquier aspecto de la App en cualquier momento, con o sin previo aviso.
              También podemos modificar estos Términos; los cambios entrarán en
              vigencia al publicarse en la App.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">9. Terminación</h2>
            <p>
              Podemos suspender o terminar tu acceso a la App si violás estos
              términos o por cualquier otra razón a nuestra discreción.
              Podés dejar de usar la App en cualquier momento.
            </p>
            <p className="mt-3">
              Si deseás eliminar tu cuenta, podés hacerlo desde la configuración
              de la App o contactándonos directamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">10. Ley Aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de la República Argentina.
              Cualquier disputa será resuelta en los tribunales competentes de
              la Ciudad Autónoma de Buenos Aires.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">11. Contacto</h2>
            <p>
              Si tenés preguntas sobre estos Términos y Condiciones, podés contactarnos en:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> soporte@reydeltruco.app
            </p>
          </section>

          <section className="bg-[#1a1a1a] border border-[#D4A574] border-opacity-30 rounded-lg p-4 mt-8">
            <p className="text-center text-sm">
              Al usar Rey del Truco, confirmás que leíste, entendiste y aceptás
              estos Términos y Condiciones.
            </p>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-[#D4A574] border-opacity-30">
          <p className="text-center text-[#F5DEB3] opacity-60 text-sm">
            © {new Date().getFullYear()} Rey del Truco. Todos los derechos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default TermsOfService;
