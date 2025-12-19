// components/PrivacyPolicy.jsx
import React from 'react';

const PrivacyPolicy = ({ onBack }) => {
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
            Política de Privacidad
          </h1>
        </header>

        {/* Content */}
        <div className="prose prose-invert max-w-none text-[#F5DEB3] space-y-6">
          <p className="text-sm opacity-70">
            Última actualización: {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">1. Información que Recopilamos</h2>
            <p>
              <strong>Rey del Truco</strong> ("la App") recopila la siguiente información:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Información de cuenta:</strong> Si elegís crear una cuenta, recopilamos tu email y nombre (si usás Google para registrarte).</li>
              <li><strong>Datos de juego:</strong> Puntuaciones, historial de partidas, y estadísticas de juego.</li>
              <li><strong>Datos del dispositivo:</strong> Tipo de dispositivo y sistema operativo para optimizar la experiencia.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">2. Uso de la Información</h2>
            <p>Utilizamos tu información para:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Proporcionar y mejorar los servicios de la App</li>
              <li>Sincronizar tus datos entre dispositivos</li>
              <li>Generar estadísticas personalizadas de tus partidas</li>
              <li>Permitir funciones sociales como rankings (en futuras versiones)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">3. Almacenamiento de Datos</h2>
            <p>
              Tus datos se almacenan de forma segura en servidores de <strong>Supabase</strong>,
              que cumple con estándares de seguridad de la industria. Los datos de juego
              también se guardan localmente en tu dispositivo para permitir el uso sin conexión.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">4. Compartir Información</h2>
            <p>
              <strong>No vendemos ni compartimos tu información personal</strong> con terceros,
              excepto en los siguientes casos:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Cuando es requerido por ley</li>
              <li>Para proteger nuestros derechos legales</li>
              <li>Con proveedores de servicios que nos ayudan a operar la App (ej: Supabase para almacenamiento)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">5. Uso Sin Cuenta</h2>
            <p>
              Podés usar la App sin crear una cuenta. En este caso, tus datos se almacenan
              únicamente en tu dispositivo y no se envían a nuestros servidores.
              Si desinstalás la App, estos datos se perderán.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">6. Tus Derechos</h2>
            <p>Tenés derecho a:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Acceder a tus datos personales</li>
              <li>Corregir datos incorrectos</li>
              <li>Eliminar tu cuenta y todos tus datos</li>
              <li>Exportar tus datos en un formato portable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">7. Seguridad</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger
              tu información, incluyendo encriptación de datos en tránsito y en reposo,
              autenticación segura, y acceso restringido a los datos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">8. Menores de Edad</h2>
            <p>
              La App no está dirigida a menores de 13 años. No recopilamos intencionalmente
              información de niños menores de 13 años. Si sos padre/madre y creés que tu
              hijo nos proporcionó información, contactanos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">9. Cambios a esta Política</h2>
            <p>
              Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos
              sobre cambios significativos a través de la App o por email si tenés una cuenta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A574] mb-3">10. Contacto</h2>
            <p>
              Si tenés preguntas sobre esta política de privacidad, podés contactarnos en:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> soporte@reydeltruco.app
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

export default PrivacyPolicy;
