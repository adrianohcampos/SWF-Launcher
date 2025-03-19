"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Folder} from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Settings {
  rufflePath: string;
  gamesFolder: string;
  darkMode: boolean;
  defaultView: 'grid' | 'list';
  autoRefresh: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ open, onOpenChange }) => {
  const [settings, setSettings] = useState<Settings>({
    rufflePath: '',
    gamesFolder: '',
    darkMode: false,
    defaultView: 'grid',
    autoRefresh: true
  });
  
  const [isElectron, setIsElectron] = useState(false);
  
  useEffect(() => {
    // Verificar se estamos em um ambiente Electron
    setIsElectron(window.require !== undefined);
    
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      
      // Carregar configurações salvas
      ipcRenderer.invoke('get-settings').then((savedSettings: Settings | null) => {
        if (savedSettings) {
          setSettings(savedSettings);
        }
      }).catch((err: Error) => {
        console.error('Erro ao carregar configurações:', err);
      });
    }
  }, [open]);
  
  const handleSave = () => {
    if (isElectron) {
      const { ipcRenderer } = window.require('electron');
      
      // Salvar configurações
      ipcRenderer.invoke('save-settings', settings)
        .then(() => {
          console.log('Configurações salvas com sucesso');
          onOpenChange(false);
        })
        .catch((err: Error) => {
          console.error('Erro ao salvar configurações:', err);
        });
    } else {
      console.log('Configurações que seriam salvas:', settings);
      onOpenChange(false);
    }
  };
  
  const handleBrowseFolder = (settingKey: 'rufflePath' | 'gamesFolder') => {
    if (isElectron) {
      const { ipcRenderer } = window.require('electron');
      
      ipcRenderer.invoke('browse-folder', { 
        title: settingKey === 'rufflePath' ? 'Selecionar executável do Ruffle' : 'Selecionar pasta de jogos',
        defaultPath: settings[settingKey] || undefined,
        properties: settingKey === 'rufflePath' 
          ? ['openFile'] 
          : ['openDirectory'],
        filters: settingKey === 'rufflePath' 
          ? [{ name: 'Executáveis', extensions: ['exe'] }] 
          : undefined
      }).then((result: { canceled: boolean, filePaths: string[] }) => {
        if (!result.canceled && result.filePaths.length > 0) {
          setSettings(prev => ({
            ...prev,
            [settingKey]: result.filePaths[0]
          }));
        }
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general">
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">Geral</TabsTrigger>
            <TabsTrigger value="ruffle" className="flex-1">Ruffle</TabsTrigger>
            {/* <TabsTrigger value="appearance" className="flex-1">Aparência</TabsTrigger> */}
          </TabsList>
          
          <TabsContent value="general">
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="gamesFolder">Pasta de Jogos</Label>
                <div className="flex gap-2">
                  <Input 
                    id="gamesFolder" 
                    value={settings.gamesFolder} 
                    onChange={(e) => setSettings(prev => ({ ...prev, gamesFolder: e.target.value }))} 
                    placeholder="Caminho para a pasta de jogos"
                    className="bg-[#333] text-white"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => handleBrowseFolder('gamesFolder')}
                    disabled={!isElectron}
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    Procurar
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Pasta onde os arquivos .swf e suas capas estão armazenados
                </p>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoRefresh">Atualização Automática</Label>
                    <p className="text-xs text-gray-400 mt-1">
                      Atualizar automaticamente a biblioteca ao iniciar
                    </p>
                  </div>
                  <Switch 
                    id="autoRefresh" 
                    checked={settings.autoRefresh} 
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoRefresh: checked }))} 
                  />
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <Label htmlFor="defaultView">Visualização Padrão</Label>
                <div className="flex gap-2">
                  <Button 
                    variant={settings.defaultView === 'grid' ? 'default' : 'outline'}
                    className={settings.defaultView === 'grid' ? 'bg-[#0074e4] text-white' : 'text-gray-400'}
                    onClick={() => setSettings(prev => ({ ...prev, defaultView: 'grid' }))}
                  >
                    Grade
                  </Button>
                  <Button 
                    variant={settings.defaultView === 'list' ? 'default' : 'outline'}
                    className={settings.defaultView === 'list' ? 'bg-[#0074e4] text-white' : 'text-gray-400'}
                    onClick={() => setSettings(prev => ({ ...prev, defaultView: 'list' }))}
                  >
                    Lista
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="ruffle">
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="rufflePath">Caminho do Ruffle</Label>
                <div className="flex gap-2">
                  <Input 
                    id="rufflePath" 
                    value={settings.rufflePath} 
                    onChange={(e) => setSettings(prev => ({ ...prev, rufflePath: e.target.value }))} 
                    placeholder="Caminho para o executável do Ruffle"
                    className="bg-[#333] text-white"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => handleBrowseFolder('rufflePath')}
                    disabled={!isElectron}
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    Procurar
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Caminho para o executável do Ruffle (ruffle.exe)
                </p>
              </div>
              
              <div className="mt-4 p-4 bg-[#2a2a2a] rounded-md">
                <h3 className="text-sm font-medium mb-2">Sobre o Ruffle</h3>
                <p className="text-xs text-gray-400">
                  Ruffle é um emulador de Flash Player escrito em Rust que permite executar arquivos SWF sem o Adobe Flash Player.
                  Você pode baixar a versão mais recente do Ruffle no <a href="https://ruffle.rs/#downloads" target="_blank" rel="noopener noreferrer" className="text-[#0074e4] hover:underline">site oficial</a>.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance">
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="darkMode">Modo Escuro</Label>
                  <p className="text-xs text-gray-400 mt-1">
                    Ativar tema escuro para a interface
                  </p>
                </div>
                <Switch 
                  id="darkMode" 
                  checked={settings.darkMode} 
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, darkMode: checked }))} 
                />
              </div>
              
              <div className="mt-4 p-4 bg-[#2a2a2a] rounded-md">
                <h3 className="text-sm font-medium mb-2">Personalização</h3>
                <p className="text-xs text-gray-400">
                  Mais opções de personalização serão adicionadas em versões futuras.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            onClick={handleSave}
            className="bg-[#0074e4] hover:bg-[#0066cc] text-white"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
