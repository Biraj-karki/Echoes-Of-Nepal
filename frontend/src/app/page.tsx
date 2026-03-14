import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import FeaturedDestinations from "@/components/home/FeaturedDestinations";
import ExploreMapCTA from "@/components/home/ExploreMapCTA";
import LatestStories from "@/components/home/LatestStories";
import CallToAction from "@/components/home/CallToAction";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#020617] selection:bg-blue-500/30">
      <HeroSection />
      <StatsSection />
      <FeaturedDestinations />
      <ExploreMapCTA />
      <LatestStories />
      <CallToAction />
    </main>
  );
}
