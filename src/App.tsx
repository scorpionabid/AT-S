import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Departments from "./pages/Departments";
import Institutions from "./pages/Institutions";
import Preschools from "./pages/Preschools";
import Regions from "./pages/Regions";
import Sectors from "./pages/Sectors";
import Hierarchy from "./pages/Hierarchy";
import Surveys from "./pages/Surveys";
import SurveyApproval from "./pages/SurveyApproval";
import SurveyResults from "./pages/SurveyResults";
import SurveyArchive from "./pages/SurveyArchive";
import Tasks from "./pages/Tasks";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/users" element={<Users />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/institutions" element={<Institutions />} />
          <Route path="/preschools" element={<Preschools />} />
          <Route path="/regions" element={<Regions />} />
          <Route path="/sectors" element={<Sectors />} />
          <Route path="/hierarchy" element={<Hierarchy />} />
          <Route path="/surveys" element={<Surveys />} />
          <Route path="/surveys/approval" element={<SurveyApproval />} />
          <Route path="/surveys/results" element={<SurveyResults />} />
          <Route path="/surveys/archive" element={<SurveyArchive />} />
          <Route path="/tasks" element={<Tasks />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
