import {Button} from "@/components/ui/button";
import {useNavigate} from "react-router-dom";

const Index = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl text-center animate-fade-in">
                    <h1
                        className="
                            text-5xl md:text-6xl
                            mb-6
                            bg-gradient-primary
                            bg-clip-text
                            text-transparent
                            tracking-tight
                            subpixel-antialiased
                          "
                        style={{
                            fontFamily: "'Ria', sans-serif",
                            fontWeight: 800,
                            WebkitFontSmoothing: "antialiased",
                            MozOsxFontSmoothing: "grayscale",
                            fontSmooth: "always",
                        }}
                    >
                        피방자리
                    </h1>

                    <div className="flex gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-gradient-primary shadow-elegant"
                            onClick={() => navigate("/auth")}
                        >
                            로그인
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Index;
