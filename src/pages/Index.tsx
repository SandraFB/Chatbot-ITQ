import { ChatInterface } from "@/components/ChatInterface";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Welcome Banner */}
      <div className="bg-gradient-hero text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">¡Bienvenido al Asistente Virtual TecNM!</h2>
          <p className="text-white/90">
            Estoy aquí para ayudarte con información sobre carreras, admisión, becas y servicios estudiantiles del Campus Querétaro.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto h-full">
          <Card className="h-full flex flex-col shadow-lg">
            <ChatInterface />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
