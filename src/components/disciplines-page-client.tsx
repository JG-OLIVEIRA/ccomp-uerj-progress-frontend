
"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { DisciplinesList } from './disciplines-list';
import type { Course } from '@/lib/courses';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Sync } from 'lucide-react';

type DisciplinesPageClientProps = {
  initialDisciplines: Course[];
};

export function DisciplinesPageClient({ initialDisciplines }: DisciplinesPageClientProps) {
  const [isScrapingDisciplines, setIsScrapingDisciplines] = useState(false);
  const [isScrapingWhatsapp, setIsScrapingWhatsapp] = useState(false);
  const [lastDisciplineScrape, setLastDisciplineScrape] = useState<string | null>(null);
  const [lastWhatsappScrape, setLastWhatsappScrape] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLastDisciplineScrape(localStorage.getItem('lastDisciplineScrape'));
    setLastWhatsappScrape(localStorage.getItem('lastWhatsappScrape'));
  }, []);

  const handleScrape = async (type: 'disciplines' | 'whatsapp') => {
    const isDisciplines = type === 'disciplines';
    const endpoint = isDisciplines ? '/api/disciplines/actions/scrape' : '/api/disciplines/actions/scrape-whatsapp';
    const setIsScraping = isDisciplines ? setIsScrapingDisciplines : setIsScrapingWhatsapp;
    const setLastScrape = isDisciplines ? setLastDisciplineScrape : setLastWhatsappScrape;
    const storageKey = isDisciplines ? 'lastDisciplineScrape' : 'lastWhatsappScrape';
    const successMessage = isDisciplines ? 'disciplinas' : 'grupos de WhatsApp';

    setIsScraping(true);
    try {
      const response = await fetch(endpoint, { method: 'POST' });

      if (response.status !== 202) {
        throw new Error('Falha ao iniciar a atualização.');
      }

      const now = new Date().toLocaleString('pt-BR');
      setLastScrape(now);
      localStorage.setItem(storageKey, now);

      toast({
        title: 'Atualização Iniciada',
        description: `O processo de atualização de ${successMessage} foi iniciado em segundo plano. Os dados estarão disponíveis em breve.`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.',
        variant: 'destructive',
      });
    } finally {
      setIsScraping(false);
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return dateString;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
                <CardTitle>Lista de Disciplinas</CardTitle>
                <CardDescription>
                Visualize todas as disciplinas do curso de Ciência da Computação.
                </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0">
                <Button onClick={() => handleScrape('disciplines')} disabled={isScrapingDisciplines} size="sm">
                    <Sync className={`mr-2 h-4 w-4 ${isScrapingDisciplines ? 'animate-spin' : ''}`} />
                    Atualizar Disciplinas
                </Button>
                <Button onClick={() => handleScrape('whatsapp')} disabled={isScrapingWhatsapp} size="sm">
                     <Sync className={`mr-2 h-4 w-4 ${isScrapingWhatsapp ? 'animate-spin' : ''}`} />
                    Atualizar Grupos
                </Button>
            </div>
        </div>
         <div className="text-xs text-muted-foreground mt-4 space-y-1 sm:text-right">
            <p>Última atualização (Disciplinas): {formatDate(lastDisciplineScrape)}</p>
            <p>Última atualização (Grupos): {formatDate(lastWhatsappScrape)}</p>
        </div>
      </CardHeader>
      <DisciplinesList initialDisciplines={initialDisciplines} />
    </Card>
  );
}
