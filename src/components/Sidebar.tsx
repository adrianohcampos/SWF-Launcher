import React, { useState } from 'react';
import { 
  Sidebar as SidebarComponent, 
  SidebarContent, 
  SidebarHeader, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarFooter
} from './ui/sidebar';
import { Gamepad2, Home, Settings } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

interface SidebarProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  return (
    <>
      <SidebarComponent>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-4">
            <Gamepad2 className="h-6 w-6 text-[#0074e4]" />
            <h1 className="text-xl font-bold">SWF Launcher</h1>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={selectedCategory === null}
                    onClick={() => onCategorySelect(null)}
                  >
                    <Home className="h-4 w-4" />
                    <span>Todos os Jogos</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupLabel>Categorias</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {categories.map(category => (
                  <SidebarMenuItem key={category}>
                    <SidebarMenuButton 
                      isActive={selectedCategory === category}
                      onClick={() => onCategorySelect(category)}
                    >
                      <span>{category}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setSettingsOpen(true)}>
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarComponent>
      
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
};
