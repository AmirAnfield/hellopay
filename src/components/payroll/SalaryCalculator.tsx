'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrutSalaireInput, StatutSalarie } from '@/services/payroll';

/**
 * Type pour les résultats du calcul
 */
interface CalculationResult {
  brut: {
    brutTotal: number;
    details: {
      base: number;
      heureSup25: number;
      heureSup50: number;
      primes: number;
    }
  };
  cotisations: {
    totalCotisations: number;
    salaireBrut: number;
    salaireNet: number;
    details: {
      santé: number;
      retraite: number;
      chômage: number;
      autres: number;
    }
  };
}

/**
 * Composant de calculateur de salaire
 */
export default function SalaryCalculator() {
  // États du formulaire
  const [salaireBase, setSalaireBase] = useState<number>(1747.20); // SMIC 2023
  const [heuresSup25, setHeuresSup25] = useState<number>(0);
  const [heuresSup50, setHeuresSup50] = useState<number>(0);
  const [primes, setPrimes] = useState<number>(0);
  const [statut, setStatut] = useState<StatutSalarie>('non-cadre');
  
  // État pour le résultat
  const [result, setResult] = useState<CalculationResult | null>(null);
  
  // Fonction de calcul (simulation côté client)
  const calculerSalaire = () => {
    // Construction des données d'entrée
    const input: BrutSalaireInput = {
      salaireBase,
      heuresSup25,
      heuresSup50,
      primes
    };
    
    // Simulation du calcul (dans une vraie impl. ce serait un appel API)
    // Calcul du brut
    const tauxHoraire = salaireBase / 151.67;
    const montantHeuresSup25 = arrondir(tauxHoraire * 1.25 * heuresSup25);
    const montantHeuresSup50 = arrondir(tauxHoraire * 1.5 * heuresSup50);
    const brutTotal = arrondir(salaireBase + montantHeuresSup25 + montantHeuresSup50 + primes);
    
    // Simulation des taux selon statut
    const tauxCotisations = {
      santé: 0.07,
      retraite: statut === 'cadre' ? 0.125 : 0.115,
      chômage: 0,
      autres: 0.097
    };
    
    // Calcul des cotisations
    const cotisationSante = arrondir(brutTotal * tauxCotisations.santé);
    const cotisationRetraite = arrondir(brutTotal * tauxCotisations.retraite);
    const cotisationChomage = arrondir(brutTotal * tauxCotisations.chômage);
    const cotisationAutres = arrondir(brutTotal * tauxCotisations.autres);
    
    const totalCotisations = arrondir(
      cotisationSante + cotisationRetraite + cotisationChomage + cotisationAutres
    );
    
    const salaireNet = arrondir(brutTotal - totalCotisations);
    
    // Mise à jour du résultat
    setResult({
      brut: {
        brutTotal,
        details: {
          base: salaireBase,
          heureSup25: montantHeuresSup25,
          heureSup50: montantHeuresSup50,
          primes
        }
      },
      cotisations: {
        totalCotisations,
        salaireBrut: brutTotal,
        salaireNet,
        details: {
          santé: cotisationSante,
          retraite: cotisationRetraite,
          chômage: cotisationChomage,
          autres: cotisationAutres
        }
      }
    });
  };
  
  // Fonction utilitaire d'arrondi
  const arrondir = (value: number): number => {
    return Math.round(value * 100) / 100;
  };
  
  // Fonction de formatage des montants
  const formatAmount = (amount: number): string => {
    return amount.toFixed(2).replace('.', ',') + ' €';
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Calculateur de salaire</CardTitle>
          <CardDescription>Calculez le salaire brut et net en fonction des paramètres</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaireBase">Salaire mensuel de base</Label>
                <Input
                  id="salaireBase"
                  type="number"
                  value={salaireBase}
                  onChange={(e) => setSalaireBase(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="statut">Statut</Label>
                <Select 
                  value={statut} 
                  onValueChange={(value) => setStatut(value as StatutSalarie)}
                >
                  <SelectTrigger id="statut">
                    <SelectValue placeholder="Sélectionnez le statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non-cadre">Non-cadre</SelectItem>
                    <SelectItem value="cadre">Cadre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heuresSup25">Heures supplémentaires à 25%</Label>
                <Input
                  id="heuresSup25"
                  type="number"
                  value={heuresSup25}
                  onChange={(e) => setHeuresSup25(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="heuresSup50">Heures supplémentaires à 50%</Label>
                <Input
                  id="heuresSup50"
                  type="number"
                  value={heuresSup50}
                  onChange={(e) => setHeuresSup50(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primes">Primes</Label>
                <Input
                  id="primes"
                  type="number"
                  value={primes}
                  onChange={(e) => setPrimes(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <Button onClick={calculerSalaire} className="w-full">Calculer</Button>
          </div>
          
          {result && (
            <div className="mt-8">
              <Tabs defaultValue="summary">
                <TabsList className="w-full">
                  <TabsTrigger value="summary" className="flex-1">Résumé</TabsTrigger>
                  <TabsTrigger value="details" className="flex-1">Détails</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Salaire brut</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{formatAmount(result.brut.brutTotal)}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Cotisations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{formatAmount(result.cotisations.totalCotisations)}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Salaire net</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{formatAmount(result.cotisations.salaireNet)}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Détails du brut</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <table className="w-full">
                          <tbody>
                            <tr>
                              <td>Salaire de base</td>
                              <td className="text-right">{formatAmount(result.brut.details.base)}</td>
                            </tr>
                            <tr>
                              <td>Heures sup. (25%)</td>
                              <td className="text-right">{formatAmount(result.brut.details.heureSup25)}</td>
                            </tr>
                            <tr>
                              <td>Heures sup. (50%)</td>
                              <td className="text-right">{formatAmount(result.brut.details.heureSup50)}</td>
                            </tr>
                            <tr>
                              <td>Primes</td>
                              <td className="text-right">{formatAmount(result.brut.details.primes)}</td>
                            </tr>
                            <tr className="font-bold">
                              <td>Total brut</td>
                              <td className="text-right">{formatAmount(result.brut.brutTotal)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Détails des cotisations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <table className="w-full">
                          <tbody>
                            <tr>
                              <td>Santé</td>
                              <td className="text-right">{formatAmount(result.cotisations.details.santé)}</td>
                            </tr>
                            <tr>
                              <td>Retraite</td>
                              <td className="text-right">{formatAmount(result.cotisations.details.retraite)}</td>
                            </tr>
                            <tr>
                              <td>Chômage</td>
                              <td className="text-right">{formatAmount(result.cotisations.details.chômage)}</td>
                            </tr>
                            <tr>
                              <td>Autres (CSG, CRDS...)</td>
                              <td className="text-right">{formatAmount(result.cotisations.details.autres)}</td>
                            </tr>
                            <tr className="font-bold">
                              <td>Total cotisations</td>
                              <td className="text-right">{formatAmount(result.cotisations.totalCotisations)}</td>
                            </tr>
                            <tr className="font-bold">
                              <td>Salaire net</td>
                              <td className="text-right">{formatAmount(result.cotisations.salaireNet)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <p className="text-sm text-gray-500">
            *Les calculs sont effectués à titre indicatif, selon les taux standards.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 