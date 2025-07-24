
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Route, History, Ship, Search, Plus, Settings, CloudRain, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DirectTokenInput from "./DirectTokenInput";
import WeatherLayerConfig from "./WeatherLayerConfig";

const navigationItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Maps", path: "/maps", icon: FolderOpen },
  { title: "Routes", path: "/routes", icon: Route },
  { title: "History", path: "/history", icon: History },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isDTNDialogOpen, setIsDTNDialogOpen] = useState(false);
  const [isWeatherDialogOpen, setIsWeatherDialogOpen] = useState(false);

  // Helper function
  const isActive = (path: string) => 
    path === "/" ? currentPath === path : currentPath.startsWith(path);

  return (
    <Sidebar className="w-16 bg-white/90 shadow-md z-10 flex flex-col" collapsible="none">
      <div className="p-2 border-b flex justify-center">
        <Ship className="h-6 w-6 text-vessel-green" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 py-4">
              <Button variant="outline" size="icon" className="w-full mb-4 bg-white">
                <Search className="h-4 w-4" />
              </Button>
              
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title} className="mb-2">
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.path}
                        end={item.path === "/"}
                        className={({ isActive }) =>
                          `flex items-center justify-center py-2 rounded-md transition-colors ${
                            isActive
                              ? "bg-vessel-green text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`
                        }
                      >
                        <item.icon className="h-5 w-5" />
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>

              {/* DTN Token Dialog */}
              <Dialog open={isDTNDialogOpen} onOpenChange={setIsDTNDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="w-full mb-2 bg-white" title="DTN Token">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>DTN Token Configuration</DialogTitle>
                  </DialogHeader>
                  <div className="relative">
                    <DirectTokenInput />
                  </div>
                </DialogContent>
              </Dialog>

              {/* Weather Layer Configuration Dialog */}
              <Dialog open={isWeatherDialogOpen} onOpenChange={setIsWeatherDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="w-full mb-2 bg-white" title="Weather Layer Configuration">
                    <CloudRain className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Weather Layer Configuration</DialogTitle>
                  </DialogHeader>
                  <div className="relative">
                    <WeatherLayerConfig />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-2 mb-4">
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700" 
          size="icon"
          onClick={() => navigate('/create-voyage')}
          title="Create New Voyage"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;
