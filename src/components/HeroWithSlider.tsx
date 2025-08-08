import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Eye, Wand2 } from 'lucide-react';

interface Slide {
  id: string;
  media: string;
  type: 'image' | 'gif' | 'video';
  title: string;
  caption: string;
  pageUrl?: string;
}

interface HeroWithSliderProps {
  slides?: Slide[];
  onViewPage?: (slide: Slide) => void;
  onGenerateNew?: () => void;
}

const defaultSlides: Slide[] = [
  {
    id: '1',
    media: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
    type: 'image',
    title: 'صفحة هبوط احترافية للتجارة الإلكترونية',
    caption: 'تصميم عصري وجذاب يزيد من معدل التحويل بنسبة 95%'
  },
  {
    id: '2',
    media: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200',
    type: 'image',
    title: 'صفحات متجاوبة مع جميع الأجهزة',
    caption: 'تجربة مستخدم مثالية على الهاتف والكمبيوتر اللوحي والحاسوب'
  },
  {
    id: '3',
    media: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200',
    type: 'image',
    title: 'تحليل ذكي للمنافسين',
    caption: 'استخدام الذكاء الاصطناعي لتحليل السوق وتحسين الأداء'
  },
  {
    id: '4',
    media: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1200',
    type: 'image',
    title: 'قوالب متعددة الأغراض',
    caption: 'اختر من بين أكثر من 50 قالب مصمم خصيصاً لزيادة المبيعات'
  }
];

export default function HeroWithSlider({ 
  slides = defaultSlides, 
  onViewPage, 
  onGenerateNew 
}: HeroWithSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && slides.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, slides.length]);

  // Preload images
  useEffect(() => {
    slides.forEach((slide) => {
      if (slide.type === 'image' && !loadedImages.has(slide.media)) {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(slide.media));
        };
        img.src = slide.media;
      }
    });
  }, [slides, loadedImages]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleMouseEnter = () => {
    setIsPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsPlaying(true);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleViewPage = (slide: Slide) => {
    onViewPage?.(slide);
  };

  const handleGenerateNew = () => {
    onGenerateNew?.();
  };

  const renderMedia = (slide: Slide) => {
    switch (slide.type) {
      case 'video':
        return (
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={slide.media} type="video/mp4" />
          </video>
        );
      case 'gif':
      case 'image':
      default:
        return (
          <img
            src={slide.media}
            alt={slide.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        );
    }
  };

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-100 pt-16">
      {/* Hero Content */}
      <div className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            أنشئ صفحات هبوط
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}مذهلة
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8" dir="rtl">
            حوّل أي رابط منتج إلى صفحة هبوط محسّنة للتحويل باستخدام تقنية الذكاء الاصطناعي المتقدمة. 
            لا حاجة للبرمجة، نتائج احترافية مضمونة.
          </p>
        </motion.div>

        {/* Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-6xl mx-auto"
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Slider Container */}
            <div className="relative h-96 md:h-[500px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  {/* Media */}
                  <div className="relative h-full">
                    {renderMedia(slides[currentSlide])}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white" dir="rtl">
                      <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl md:text-3xl font-bold mb-4"
                      >
                        {slides[currentSlide].title}
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg mb-6 opacity-90"
                      >
                        {slides[currentSlide].caption}
                      </motion.p>
                      
                      {/* CTAs */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4"
                      >
                        <button
                          onClick={() => handleViewPage(slides[currentSlide])}
                          className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                          data-route="view-page"
                        >
                          <Eye className="w-5 h-5 ml-2" />
                          عرض
                        </button>
                        <button
                          onClick={handleGenerateNew}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                          data-route="generate"
                        >
                          <Wand2 className="w-5 h-5 ml-2" />
                          توليد جديد
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              {slides.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Dots Indicator */}
            {slides.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide
                        ? 'bg-white'
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Play/Pause Indicator */}
            {slides.length > 1 && (
              <div className="absolute top-4 right-4">
                <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400' : 'bg-yellow-400'}`} />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}