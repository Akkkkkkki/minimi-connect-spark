
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    quote: "MINIMI helped me find a hiking buddy who ended up becoming one of my closest friends. The questionnaire really matched our energy levels and outdoor interests perfectly!",
    name: "Alex Thompson",
    role: "Event Match",
    event: "Mountain Hiking"
  },
  {
    id: 2,
    quote: "I was skeptical about using an app for networking, but MINIMI connected me with a mentor in my industry who's been invaluable for my career growth.",
    name: "Sarah Chen",
    role: "Professional Connection",
    event: "Industry Meetup"
  },
  {
    id: 3,
    quote: "After several disappointing dating apps, MINIMI was refreshing. The matching algorithm actually considered what matters to me, and I've been dating my match for 6 months now!",
    name: "Marcus Johnson",
    role: "Romantic Match",
    event: "Coffee Connections"
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">Success Stories</h2>
          <p className="mt-4 max-w-2xl mx-auto text-gray-600 text-lg">
            Real people finding meaningful connections through MINIMI.
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-accent/5 to-white p-8 md:p-12 shadow-sm">
            <div 
              className="transition-all duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              <div className="flex">
                {testimonials.map((testimonial) => (
                  <div 
                    key={testimonial.id} 
                    className="min-w-full px-4"
                  >
                    <div className="flex flex-col h-full">
                      <div className="mb-6">
                        <svg className="h-8 w-8 text-accent/40" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>
                      <p className="text-xl md:text-2xl text-gray-700 mb-8 flex-grow">
                        "{testimonial.quote}"
                      </p>
                      <div className="mt-auto">
                        <p className="font-semibold text-primary">{testimonial.name}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-500">{testimonial.role}</span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-accent">{testimonial.event}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-4 md:-translate-x-6">
            <button 
              onClick={goToPrev}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-primary hover:text-accent transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          </div>
          
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-4 md:translate-x-6">
            <button 
              onClick={goToNext}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-primary hover:text-accent transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentIndex ? "bg-accent" : "bg-gray-300"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
