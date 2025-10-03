import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { Moon, Sun, Laptop, Download, Upload, Trash2 } from 'lucide-react';
import AnimatedContainer from '@/components/AnimatedContainer';
import { useData } from '@/context/DataContext';
import { Separator } from '@/components/ui/separator';

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { exportData, importData, clearAllData } = useData();

  const handleExport = () => {
    exportData();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file);
    }
  };

  const handleClearData = () => {
    if (
      window.confirm(
        'Are you sure you want to delete all your data? This action cannot be undone.'
      )
    ) {
      clearAllData();
    }
  };

  return (
    <AnimatedContainer className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Customize your experience and manage your data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Choose how Focus Hub looks and feels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="text-sm font-medium mb-4">Theme</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="h-24 flex flex-col gap-2"
              >
                <Sun className="h-6 w-6" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="h-24 flex flex-col gap-2"
              >
                <Moon className="h-6 w-6" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
                className="h-24 flex flex-col gap-2"
              >
                <Laptop className="h-6 w-6" />
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export, import, or clear your application data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Export Data</h3>
              <p className="text-sm text-muted-foreground">
                Save your tasks and sessions to a JSON file.
              </p>
            </div>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Import Data</h3>
              <p className="text-sm text-muted-foreground">
                Load data from a JSON file.
              </p>
            </div>
            <Button asChild>
              <label htmlFor="import-file">
                <Upload className="mr-2 h-4 w-4" />
                Import
                <input
                  type="file"
                  id="import-file"
                  className="hidden"
                  accept=".json"
                  onChange={handleImport}
                />
              </label>
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/10">
            <div>
              <h3 className="font-medium text-destructive">Clear All Data</h3>
              <p className="text-sm text-destructive/80">
                Permanently delete all tasks and sessions.
              </p>
            </div>
            <Button variant="destructive" onClick={handleClearData}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
};

export default SettingsPage;