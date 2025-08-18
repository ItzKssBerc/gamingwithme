import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="relative h-screen flex items-center justify-center text-center text-white">
        <video
          autoPlay
          muted
          loop
          className="absolute z-[-1] w-full h-full object-cover"
        >
          <source src="/frontpage/gaming_06.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-[-1]"></div>
        <div className="z-10">
          <h1 className="text-4xl font-bold leading-none sm:text-5xl">
            Welcome to
            <span className="text-primary"> GamingWithMe</span>
          </h1>
          <p className="px-8 mt-8 mb-12 text-lg">
            Find your next gaming partner or create your own gaming events. Join a community of passionate gamers!
          </p>
        </div>
      </section>
      <section id="how-it-works" className="py-20 bg-background text-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-primary text-primary-foreground">
                <span className="text-4xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create an Account</h3>
              <p className="text-muted-foreground">
                Sign up and create your profile to start connecting with other gamers.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-primary text-primary-foreground">
                <span className="text-4xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find or Create Events</h3>
              <p className="text-muted-foreground">
                Browse existing gaming events or create your own for others to join.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-primary text-primary-foreground">
                <span className="text-4xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Game On!</h3>
              <p className="text-muted-foreground">
                Join events, meet new people, and enjoy your favorite games together.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}