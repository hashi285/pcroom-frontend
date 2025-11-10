import { Navigation } from "@/components/Navigation";
import { MembershipCard } from "@/components/MembershipCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield, Zap, Users, Apple, UserCog, Megaphone } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      
      
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
  <div className="max-w-4xl text-center animate-fade-in">
    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent tracking-tight antialiased">
      피방자리
    </h1>

    <div className="flex gap-4 justify-center">
      <Button
        size="lg"
        className="bg-gradient-primary shadow-elegant"
        onClick={() => navigate("/auth")}
      >
        Get Started
      </Button>
    </div>
  </div>
</section>


      {/* Features Section */}
      {/* <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
                icon: UserCog,
                title: "PC방 관리자",
                description: "PC방의 가동률 확인, 효율적인 자리 관리",
              },
              {
                icon: Megaphone,
                title: "공지사항",
                description: "피시방별 최신 공지사항 제공",
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
      </section> */}

      {/* CTA Section */}
      {/* <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
      </section> */}
    </div>
  );
};

export default Index;
