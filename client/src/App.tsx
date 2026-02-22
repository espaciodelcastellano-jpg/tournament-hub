import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import TournamentAdminLayout from "./components/TournamentAdminLayout";
import AdminTeams from "./pages/AdminTeams";
import AdminPlayers from "./pages/AdminPlayers";
import AdminMatches from "./pages/AdminMatches";
import AdminCheerleading from "./pages/AdminCheerleading";
import AdminLogin from "./pages/AdminLogin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin-login" component={AdminLogin} />
      
      {/* Admin Routes */}
      <Route path="/admin">
        <TournamentAdminLayout>
          <AdminTeams />
        </TournamentAdminLayout>
      </Route>
      
      <Route path="/admin/teams">
        <TournamentAdminLayout>
          <AdminTeams />
        </TournamentAdminLayout>
      </Route>
      
      <Route path="/admin/players">
        <TournamentAdminLayout>
          <AdminPlayers />
        </TournamentAdminLayout>
      </Route>
      
      <Route path="/admin/matches">
        <TournamentAdminLayout>
          <AdminMatches />
        </TournamentAdminLayout>
      </Route>
      
      <Route path="/admin/cheerleading">
        <TournamentAdminLayout>
          <AdminCheerleading />
        </TournamentAdminLayout>
      </Route>
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
