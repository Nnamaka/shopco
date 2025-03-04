import { HoodieCard } from "@/components/hoodie-card"
import { AutoSliderBanner } from "@/components/auto-slider-banner"

export default function Home() {
  const hoodies = [
    {
      id: 1,
      name: "constainer4",
      price: 149.99,
      image1: "https://i.pinimg.com/736x/92/06/56/920656e03f09691d871e149b5dad8f7f.jpg",
      image2: "https://i.pinimg.com/736x/94/d3/14/94d31436dfc73fcf93058089f69ffd96.jpg",
    },
    {
      id: 2,
      name: "container3",
      price: 154.99,
      image1: "https://i.pinimg.com/736x/92/06/56/920656e03f09691d871e149b5dad8f7f.jpg",
      image2: "https://i.pinimg.com/736x/94/d3/14/94d31436dfc73fcf93058089f69ffd96.jpg",
    },
    {
      id: 3,
      name: "Container2",
      price: 159.99,
      image1: "https://i.pinimg.com/736x/92/06/56/920656e03f09691d871e149b5dad8f7f.jpg",
      image2: "https://i.pinimg.com/736x/94/d3/14/94d31436dfc73fcf93058089f69ffd96.jpg",
    },
    {
      id: 4,
      name: "container1",
      price: 199.99,
      image1: "https://i.pinimg.com/736x/92/06/56/920656e03f09691d871e149b5dad8f7f.jpg",
      image2: "https://i.pinimg.com/736x/94/d3/14/94d31436dfc73fcf93058089f69ffd96.jpg",
    },
  ]

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* Full-screen Auto-sliding Banner */}
      <AutoSliderBanner />

      {/* Product Section */}
      <section id="product-section" className="w-full py-12 md:py-24 bg-dark-900">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-3xl font-bold text-center text-black">Containers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {hoodies.map((hoodie) => (
              <HoodieCard key={hoodie.id} {...hoodie} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

