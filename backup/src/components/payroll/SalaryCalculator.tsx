'use client';

import { useState, useEffect } from 'react';
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
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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
 * Interface pour les taux de cotisations
 */
interface TauxCotisations {
  santé: number;
  retraite: number;
  chômage: number;
  autres: number;
  [key: string]: number;
}

/**
 * Interface pour l'état des cotisations
 */
interface CotisationsEtat {
  santé: boolean;
  retraite: boolean;
  chômage: boolean;
  autres: boolean;
  [key: string]: boolean;
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
  
  // État pour les taux de cotisations
  const [tauxCotisations, setTauxCotisations] = useState<TauxCotisations>({
    santé: 0.07,
    retraite: 0.115,
    chômage: 0,
    autres: 0.097
  });
  
  // État pour l'activation des cotisations
  const [cotisationsActives, setCotisationsActives] = useState<CotisationsEtat>({
    santé: true,
    retraite: true,
    chômage: true,
    autres: true
  });
  
  // État pour le résultat
  const [result, setResult] = useState<CalculationResult | null>(null);
  
  // Mise à jour des taux de cotisations en fonction du statut
  useEffect(() => {
    setTauxCotisations(prev => ({
      ...prev,
      retraite: statut === 'cadre' ? 0.125 : 0.115
    }));
  }, [statut]);
  
  // Calculer automatiquement dès qu'un paramètre change
  useEffect(() => {
    calculerSalaire();
  }, [salaireBase, heuresSup25, heuresSup50, primes, statut, tauxCotisations, cotisationsActives]);
  
  // Fonction de calcul du salaire et des cotisations
  const calculerSalaire = () => {
    // Calcul du brut
    const tauxHoraire = salaireBase / 151.67;
    const montantHeuresSup25 = arrondir(tauxHoraire * 1.25 * heuresSup25);
    const montantHeuresSup50 = arrondir(tauxHoraire * 1.5 * heuresSup50);
    const brutTotal = arrondir(salaireBase + montantHeuresSup25 + montantHeuresSup50 + primes);
    
    // Calcul des cotisations
    const cotisationSante = cotisationsActives.santé ? arrondir(brutTotal * tauxCotisations.santé) : 0;
    const cotisationRetraite = cotisationsActives.retraite ? arrondir(brutTotal * tauxCotisations.retraite) : 0;
    const cotisationChomage = cotisationsActives.chômage ? arrondir(brutTotal * tauxCotisations.chômage) : 0;
    const cotisationAutres = cotisationsActives.autres ? arrondir(brutTotal * tauxCotisations.autres) : 0;
    
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
  
  // Modifier le taux d'une cotisation
  const handleChangeTaux = (type: keyof TauxCotisations, value: number) => {
    setTauxCotisations(prev => ({
      ...prev,
      [type]: value / 100 // Convertir le pourcentage en décimal
    }));
  };
  
  // Activer/désactiver une cotisation
  const handleToggleCotisation = (type: keyof CotisationsEtat) => {
    setCotisationsActives(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };
  
  // Fonction utilitaire d'arrondi
  const arrondir = (value: number): number => {
    return Math.round(value * 100) / 100;
  };
  
  // Fonction de formatage des montants
  const formatAmount = (amount: number): string => {
    return amount.toFixed(2).replace('.', ',') + ' €';
  };
  
  // Calculer le pourcentage pour l'affichage
  const getPercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Calculateur de salaire</CardTitle>
          <CardDescription>Calculez le salaire brut et net en fonction des paramètres</CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Résumé des résultats */}
          {result && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Salaire brut</p>
                  <p className="text-lg font-bold text-blue-700">{formatAmount(result.brut.brutTotal)}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500">Cotisations</p>
                  <p className="text-lg font-bold text-red-600">{formatAmount(result.cotisations.totalCotisations)}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500">Salaire net</p>
                  <p className="text-lg font-bold text-green-600">{formatAmount(result.cotisations.salaireNet)}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500">Taux de prélèvement</p>
                  <p className="text-lg font-bold text-purple-600">
                    {getPercentage(result.cotisations.totalCotisations, result.brut.brutTotal)}%
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Onglets principaux */}
          <Tabs defaultValue="remuneration">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="remuneration" className="flex-1">Rémunération</TabsTrigger>
              <TabsTrigger value="parametres" className="flex-1">Paramètres</TabsTrigger>
            </TabsList>
            
            {/* Onglet Rémunération */}
            <TabsContent value="remuneration">
              <Tabs defaultValue="brut">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="brut" className="flex-1">Salaire brut</TabsTrigger>
                  <TabsTrigger value="cotisations" className="flex-1">Cotisations</TabsTrigger>
                </TabsList>
                
                {/* Sous-onglet Brut */}
                <TabsContent value="brut">
                  <div className="space-y-4">
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
                        {result && heuresSup25 > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Montant: {formatAmount(result.brut.details.heureSup25)}
                          </p>
                        )}
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
                        {result && heuresSup50 > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Montant: {formatAmount(result.brut.details.heureSup50)}
                          </p>
                        )}
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
                    
                    {result && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">Détail du salaire brut</h3>
                        <table className="w-full">
                          <tbody>
                            <tr className="border-b border-blue-100">
                              <td className="py-2">Salaire de base</td>
                              <td className="py-2 text-right font-medium">{formatAmount(result.brut.details.base)}</td>
                            </tr>
                            {result.brut.details.heureSup25 > 0 && (
                              <tr className="border-b border-blue-100">
                                <td className="py-2">Heures supplémentaires (25%)</td>
                                <td className="py-2 text-right font-medium">{formatAmount(result.brut.details.heureSup25)}</td>
                              </tr>
                            )}
                            {result.brut.details.heureSup50 > 0 && (
                              <tr className="border-b border-blue-100">
                                <td className="py-2">Heures supplémentaires (50%)</td>
                                <td className="py-2 text-right font-medium">{formatAmount(result.brut.details.heureSup50)}</td>
                              </tr>
                            )}
                            {result.brut.details.primes > 0 && (
                              <tr className="border-b border-blue-100">
                                <td className="py-2">Primes</td>
                                <td className="py-2 text-right font-medium">{formatAmount(result.brut.details.primes)}</td>
                              </tr>
                            )}
                            <tr className="bg-blue-100">
                              <td className="py-2 font-semibold">Total brut</td>
                              <td className="py-2 text-right font-bold">{formatAmount(result.brut.brutTotal)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {/* Sous-onglet Cotisations */}
                <TabsContent value="cotisations">
                  <div className="space-y-6">
                    {/* Santé */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="font-medium">Cotisations santé</h3>
                          <p className="text-sm text-gray-500">Assurance maladie, URSSAF</p>
                        </div>
                        <Switch 
                          checked={cotisationsActives.santé} 
                          onCheckedChange={() => handleToggleCotisation('santé')}
                        />
                      </div>
                      
                      {cotisationsActives.santé && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <Label htmlFor="taux-sante">Taux (%)</Label>
                              <div className="flex items-center gap-2">
                                <Slider
                                  id="taux-sante"
                                  value={[tauxCotisations.santé * 100]}
                                  min={0}
                                  max={20}
                                  step={0.1}
                                  onValueChange={(value) => handleChangeTaux('santé', value[0])}
                                  className="flex-1"
                                />
                                <span className="w-12 text-right">{(tauxCotisations.santé * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                          
                          {result && (
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="flex justify-between">
                                <span>Montant:</span>
                                <span className="font-medium">{formatAmount(result.cotisations.details.santé)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Retraite */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="font-medium">Cotisations retraite</h3>
                          <p className="text-sm text-gray-500">Retraite de base et complémentaire</p>
                        </div>
                        <Switch 
                          checked={cotisationsActives.retraite} 
                          onCheckedChange={() => handleToggleCotisation('retraite')}
                        />
                      </div>
                      
                      {cotisationsActives.retraite && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <Label htmlFor="taux-retraite">Taux (%)</Label>
                              <div className="flex items-center gap-2">
                                <Slider
                                  id="taux-retraite"
                                  value={[tauxCotisations.retraite * 100]}
                                  min={0}
                                  max={20}
                                  step={0.1}
                                  onValueChange={(value) => handleChangeTaux('retraite', value[0])}
                                  className="flex-1"
                                />
                                <span className="w-12 text-right">{(tauxCotisations.retraite * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                          
                          {result && (
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="flex justify-between">
                                <span>Montant:</span>
                                <span className="font-medium">{formatAmount(result.cotisations.details.retraite)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Autres (CSG, CRDS) */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="font-medium">Autres cotisations</h3>
                          <p className="text-sm text-gray-500">CSG, CRDS, etc.</p>
                        </div>
                        <Switch 
                          checked={cotisationsActives.autres} 
                          onCheckedChange={() => handleToggleCotisation('autres')}
                        />
                      </div>
                      
                      {cotisationsActives.autres && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <Label htmlFor="taux-autres">Taux (%)</Label>
                              <div className="flex items-center gap-2">
                                <Slider
                                  id="taux-autres"
                                  value={[tauxCotisations.autres * 100]}
                                  min={0}
                                  max={20}
                                  step={0.1}
                                  onValueChange={(value) => handleChangeTaux('autres', value[0])}
                                  className="flex-1"
                                />
                                <span className="w-12 text-right">{(tauxCotisations.autres * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                          
                          {result && (
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="flex justify-between">
                                <span>Montant:</span>
                                <span className="font-medium">{formatAmount(result.cotisations.details.autres)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {result && (
                      <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Récapitulatif des cotisations</h3>
                        <table className="w-full">
                          <tbody>
                            {cotisationsActives.santé && result.cotisations.details.santé > 0 && (
                              <tr className="border-b border-red-100">
                                <td className="py-2">Santé</td>
                                <td className="py-2 text-right font-medium">{formatAmount(result.cotisations.details.santé)}</td>
                              </tr>
                            )}
                            {cotisationsActives.retraite && result.cotisations.details.retraite > 0 && (
                              <tr className="border-b border-red-100">
                                <td className="py-2">Retraite</td>
                                <td className="py-2 text-right font-medium">{formatAmount(result.cotisations.details.retraite)}</td>
                              </tr>
                            )}
                            {cotisationsActives.chômage && result.cotisations.details.chômage > 0 && (
                              <tr className="border-b border-red-100">
                                <td className="py-2">Chômage</td>
                                <td className="py-2 text-right font-medium">{formatAmount(result.cotisations.details.chômage)}</td>
                              </tr>
                            )}
                            {cotisationsActives.autres && result.cotisations.details.autres > 0 && (
                              <tr className="border-b border-red-100">
                                <td className="py-2">Autres (CSG, CRDS)</td>
                                <td className="py-2 text-right font-medium">{formatAmount(result.cotisations.details.autres)}</td>
                              </tr>
                            )}
                            <tr className="bg-red-100">
                              <td className="py-2 font-semibold">Total cotisations</td>
                              <td className="py-2 text-right font-bold">{formatAmount(result.cotisations.totalCotisations)}</td>
                            </tr>
                          </tbody>
                        </table>
                        
                        <div className="mt-4 bg-green-100 p-3 rounded">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Salaire net:</span>
                            <span className="font-bold text-lg text-green-700">{formatAmount(result.cotisations.salaireNet)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
            
            {/* Onglet Paramètres */}
            <TabsContent value="parametres">
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">Paramètres généraux</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="constante-horaire">Heures mensuelles standard</Label>
                      <Input
                        id="constante-horaire"
                        type="number"
                        value="151.67"
                        disabled
                      />
                      <p className="text-xs text-gray-500">35h/semaine × 52 semaines / 12 mois</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="plafond-secu">Plafond mensuel Sécurité Sociale (2024)</Label>
                      <Input
                        id="plafond-secu"
                        type="number"
                        value="3867"
                        disabled
                      />
                      <p className="text-xs text-gray-500">En euros</p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">Taux des cotisations</h3>
                  <div className="space-y-4">
                    <p className="text-sm">
                      Les taux de cotisations peuvent être ajustés dans l'onglet "Cotisations".
                    </p>
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Les taux réels dépendent de nombreux facteurs comme la convention collective, 
                        la taille de l'entreprise, etc. Les valeurs par défaut sont des moyennes indicatives.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
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