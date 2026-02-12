import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Carreras from "./pages/Carreras";
import Posgrados from "./pages/Posgrados";
import Admision from "./pages/Admision";
import Documentos from "./pages/Documentos";
import Contacto from "./pages/Contacto";
import Becas from "./pages/Becas";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import MiCuenta from "./pages/MiCuenta";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/mi-cuenta" element={<MiCuenta />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/carreras" element={<Carreras />} />
            <Route path="/documentos" element={<Documentos />} />
            <Route path="/posgrados" element={<Posgrados />} />
            <Route path="/admision" element={<Admision />} />
            <Route path="/becas" element={<Becas />} />
            <Route path="/contacto" element={<Contacto />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
