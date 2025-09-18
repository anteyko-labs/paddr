"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Car, Utensils, ConciergeBell, Building } from "lucide-react";

export function UtilityHighlights() {
  const utilities = [
    {
      icon: Car,
      title: "Car Rental",
      tag: "Ferrari, G63, luxury fleet",
      description: "Premium vehicles. Priority booking. Exclusive models",
      gradient: "from-red-500 to-red-700",
      benefits: ["Premium vehicles", "Priority booking", "Exclusive models"],
      image: "/images/car-rental.png",
    },
    {
      icon: Utensils,
      title: "Restaurant",
      tag: "VIP tables, free delivery",
      description: "VIP reservations. Free delivery. Chef specials",
      gradient: "from-orange-500 to-orange-700",
      benefits: ["VIP reservations", "Free delivery", "Chef specials"],
      image: "/images/restaurant.png",
    },
    {
      icon: ConciergeBell,
      title: "Concierge",
      tag: "Personal assistant services",
      description: "Event planning. Travel assistance. 24/7 support",
      gradient: "from-purple-500 to-purple-700",
      benefits: ["24/7 support", "Event planning", "Travel assistance"],
      image: "/images/concierge.png",
    },
    {
      icon: Building,
      title: "Real Estate",
      tag: "Hotel stays, property access",
      description: "Luxury hotels. Property tours. Investment access",
      gradient: "from-blue-500 to-blue-700",
      benefits: ["Luxury hotels", "Property tours", "Investment access"],
      image: "/images/real-estate.png",
    },
  ];

  return (
    <section id="utilities" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-unbounded">
            Utility Ecosystem
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Real-world services powered by PADD-R tokens
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
          {/* {utilities.map((utility, index) => (
            <Card
              key={index}
              className="group bg-gray-900/50 border-gray-800 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer card-hover overflow-hidden"
            >
              <CardContent className="p-6 text-center relative">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${utility.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <utility.icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  {utility.title}
                </h3>
                <p className="text-gray-400 mb-4">{utility.description}</p>


                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="space-y-2">
                    {utility.benefits.map((benefit, i) => (
                      <div
                        key={i}
                        className="text-sm text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-1"
                      >
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))} */}
          {utilities.map((utility, index) => (
            <div
              className="bg-[#0F131C] rounded-2xl flex justify-between relative h-[300px]"
              key={index}
            >
              <div className="p-6 max-w-[100%] md:max-w-[75%] lg:max-w-[60%]">
                <p className="text-emerald-400 bg-[#34D39912] px-2  rounded-md inline-block mb-4">
                  {utility.tag}
                </p>
                <p className="text-3xl font-bold">{utility.title}</p>
                <p className="text-[#9CA3AF] max-w-[60%] md:max-w-[100%] lg:max-w-[100%]">
                  {utility.description}
                </p>
              </div>
              <img
                src={utility.image}
                alt={utility.title}
                className="object-contain rounded-2xl md:h-fit md:w-fit lg:h-fit lg:w-fit h-2/3 ml-auto mt-auto absolute right-0 bottom-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
