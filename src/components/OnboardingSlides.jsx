// components/OnboardingSlides.jsx
import React, { useState } from 'react';

const OnboardingSlides = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      icon: '📊',
      title: 'Nunca más olvides\nquién ganó',
      description: 'Llevá la cuenta de todos\ntus partidos y mirá quién\ndomina la mesa',
    },
    {
      icon: '🔥',
      title: 'Estadísticas que\nimpresionan',
      description: 'Mirá quién te debe\nrevancha y con quién\nsos invencible',
      preview: true
    },
    {
      icon: '🏆',
      title: 'Competí por ser\nel Rey del Truco',
      description: 'Rankings locales, logros\népicos y la gloria de\nser el #1',
    }
  ];
  
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };
  
  const currentSlideData = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;
  
  return (
    <div className="rey-premium-layout min-h-screen flex items-center justify-center">
      <div className="rey-premium-container max-w-md mx-auto p-6">
        <div className="onboarding-slide text-center">
          
          {/* Icono principal */}
          <div className="text-6xl mb-8">
            {currentSlideData.icon}
          </div>
          
          {/* Preview animado para slide 2 */}
          {currentSlideData.preview && (
            <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#D4A574] border-opacity-30">
              <div className="text-[#F5DEB3] font-semibold mb-2">PEDRO vs JUAN</div>
              <div className="flex items-center justify-center space-x-4 mb-2">
                <span className="text-2xl font-bold text-[#D4A574]">17</span>
                <div className="flex-1 bg-[#F5DEB3] bg-opacity-20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#D4A574] to-[#C59660] h-full rounded-full w-2/3"></div>
                </div>
                <span className="text-2xl font-bold text-[#F5DEB3]">8</span>
              </div>
              <div className="text-sm text-[#D4A574] animate-pulse">
                🔥 Racha: Pedro x3
              </div>
            </div>
          )}
          
          {/* Título */}
          <h2 className="text-2xl font-bold mb-4 text-[#D4A574] whitespace-pre-line">
            {currentSlideData.title}
          </h2>
          
          {/* Descripción */}
          <p className="text-[#F5DEB3] opacity-90 mb-8 whitespace-pre-line leading-relaxed">
            {currentSlideData.description}
          </p>
          
          {/* Indicadores de progreso */}
          <div className="flex justify-center space-x-2 mb-8">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-[#D4A574]' 
                    : 'bg-[#F5DEB3] bg-opacity-30'
                }`}
              />
            ))}
          </div>
          
          {/* Botón de navegación */}
          <button
            onClick={nextSlide}
            className="w-full py-4 bg-gradient-to-r from-[#D4A574] to-[#C59660] text-[#0a0a0a] font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isLastSlide ? 'EMPEZAR' : 'SIGUIENTE'}
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default OnboardingSlides;