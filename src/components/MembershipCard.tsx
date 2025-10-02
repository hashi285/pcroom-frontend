import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MembershipCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  onSelect: () => void;
}

export const MembershipCard = ({ 
  title, 
  price, 
  description, 
  features, 
  popular = false,
  onSelect 
}: MembershipCardProps) => {
  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-elegant",
        popular && "border-primary shadow-elegant"
      )}
    >
      {popular && (
        <div className="absolute top-0 right-0 bg-gradient-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
          POPULAR
        </div>
      )}
      <CardHeader className="text-center pb-8 pt-6">
        <CardTitle className="text-2xl mb-2">{title}</CardTitle>
        <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          {price}
          {price !== "Free" && <span className="text-lg text-muted-foreground">/month</span>}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Button 
          className={cn(
            "w-full",
            popular && "bg-gradient-primary shadow-elegant"
          )}
          variant={popular ? "default" : "outline"}
          onClick={onSelect}
        >
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
};
