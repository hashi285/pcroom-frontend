import { Navigation } from "@/components/Navigation";
import { MembershipCard } from "@/components/MembershipCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield, Zap, Users, Apple } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const membershipTiers = [
    {
      title: "Free",
      price: "Free",
      description: "Perfect for getting started",
      features: [
        "Access to basic features",
        "Community support",
        "Limited resources",
        "Email updates",
      ],
    },
    {
      title: "Pro",
      price: "$19",
      description: "For serious members",
      features: [
        "All Free features",
        "Priority support",
        "Unlimited resources",
        "Advanced analytics",
        "Custom integrations",
      ],
      popular: true,
    },
    {
      title: "Enterprise",
      price: "$49",
      description: "For teams and organizations",
      features: [
        "All Pro features",
        "Dedicated support",
        "Team management",
        "API access",
        "Custom solutions",
        "SLA guarantee",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Welcome to 피방자리
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            PC방 자리 추천 및 경쟁 PC방 가동률 확인 기능을 제공하는 시스템입니다.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-primary shadow-elegant"
              onClick={() => navigate("/auth")}
            >
              Get Started Free
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">기능 소개</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "PC방 이용자",
                description: "빠른 자리 추천, 실시간 자리 현황 확인",
              },
              {
                icon: Zap,
                title: "PC방 관리자",
                description: "PC방의 가동률 확인, 효율적인 자리 관리",
              },
              {
                icon: Users,
                title: "이용자와 관리자 커뮤니티",
                description: "사용자와 관리자 간의 소통 공간 제공",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-card shadow-subtle hover:shadow-elegant transition-all duration-300 border border-border"
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-muted-foreground">
              Select the perfect membership tier for your needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {membershipTiers.map((tier, index) => (
              <MembershipCard
                key={index}
                {...tier}
                onSelect={() => navigate("/auth")}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-card rounded-2xl p-12 border border-primary/20 shadow-elegant">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Join our community today and unlock exclusive features
          </p>
          <Button
            size="lg"
            className="bg-gradient-primary shadow-elegant"
            onClick={() => navigate("/auth")}
          >
            Start Your Journey
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
