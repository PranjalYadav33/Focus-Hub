import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { applyTheme, getThemePreference, ThemePreference, AccentKey, getAccentPreference, applyAccent, MotionPreference, getMotionPreference, setMotionPreference } from '@/utils/theme';

const SettingsPage: React.FC = () => {
  const [theme, setTheme] = useState<ThemePreference>('system');
  const [accent, setAccent] = useState<AccentKey>('blue');
  const [motion, setMotion] = useState<MotionPreference>('system');

  useEffect(() => {
    setTheme(getThemePreference());
    setAccent(getAccentPreference());
    setMotion(getMotionPreference());
  }, []);

  const onSelect = (pref: ThemePreference) => {
    setTheme(pref);
    applyTheme(pref);
  };

  const onAccent = (a: AccentKey) => {
    setAccent(a);
    applyAccent(a);
  };

  const onMotion = (m: MotionPreference) => {
    setMotion(m);
    setMotionPreference(m);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Customize your experience</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose your theme, accent, and motion preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="text-sm font-medium mb-2">Theme</div>
            <div className="flex flex-wrap gap-2">
              <Button variant={theme === 'system' ? 'default' : 'outline'} onClick={() => onSelect('system')}>System</Button>
              <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => onSelect('light')}>Light</Button>
              <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => onSelect('dark')}>Dark</Button>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Accent</div>
            <div className="flex flex-wrap gap-2">
              {(['blue','indigo','purple','green','pink','orange'] as AccentKey[]).map(a => (
                <Button key={a} variant={accent === a ? 'default' : 'outline'} onClick={() => onAccent(a)} className="capitalize" data-testid="accent-color">
                  {a}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Motion</div>
            <div className="flex flex-wrap gap-2">
              {(['system','normal','reduced'] as MotionPreference[]).map(m => (
                <Button key={m} variant={motion === m ? 'default' : 'outline'} onClick={() => onMotion(m)} className="capitalize">
                  {m}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;

