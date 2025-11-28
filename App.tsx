import React, { useState, useRef, useEffect } from 'react';
import { ReportPreview } from './components/ReportPreview';
import { ReportData, ReportTemplate } from './types';
import { Printer, Settings, CheckCircle2, LayoutTemplate, Palette, Upload, Trash2, Hash, X, Plus, Check, Loader2, AlertTriangle, Share2, Info, ExternalLink } from 'lucide-react';

const INITIAL_DATA: ReportData = {
  companyName: "Rimberio y asociados",
  reportTitle: "REPORTE INMOBILIARIO",
  subtitle: "INMOBILIARIO",
  date: "Julio 2023",
  agentName: "Sandra haro",
  website: "www.sitioincreible.com",
  heroImage: "https://picsum.photos/1200/800",
  logoColor: "#8EB8B5",
  savedLogos: [],
  secondaryLogos: [],
  introText: "El mercado inmobiliario de la Ciudad de Alta Pinta ha experimentado cambios significativos en los últimos años. El valor de las propiedades ha aumentado constantemente debido a la creciente demanda y la escasez de oferta. En este informe, se analizará la situación actual del mercado inmobiliario de la ciudad, incluyendo los precios, la oferta y la demanda, y las tendencias en el mercado.",
  marketTrendText: "Mayor demanda de propiedades nuevas: Los compradores están buscando propiedades nuevas y modernas, lo que ha llevado a un aumento en la construcción de edificios de departamentos nuevos.",
  conclusionText: "En general, el mercado inmobiliario de la Ciudad de Alta Pinta sigue siendo fuerte debido a la alta demanda y la limitada oferta de propiedades. El precio de las propiedades ha experimentado un aumento constante en los últimos años y se espera que continúe aumentando en el futuro. Los compradores están buscando propiedades nuevas y modernas, y la inversión extranjera en propiedades en la ciudad sigue siendo alta.",
  properties: [
    {
      id: "1",
      title: "Propiedad 1",
      address: "Calle Cualquiera 123, Cualquier Lugar.",
      price: "$200,000",
      image: "https://picsum.photos/400/300?random=1",
      features: ["3 dormitorios y 2 baños completos", "Sala de estar con gran ventana", "Cocina equipada", "120 m2 de espacio habitable"]
    },
    {
      id: "2",
      title: "Propiedad 2",
      address: "Calle Cualquiera 123, Cualquier Lugar.",
      price: "$500,000",
      image: "https://picsum.photos/400/300?random=2",
      features: ["Ubicada en barrio residencial", "4 dormitorios y 3 baños", "Jardín con piscina", "Garaje para 2 coches"]
    },
    {
      id: "3",
      title: "Propiedad 3",
      address: "Calle Cualquiera 123, Cualquier Lugar.",
      price: "$300,000",
      image: "https://picsum.photos/400/300?random=3",
      features: ["1 dormitorio y 1 baño", "Techos altos", "Cocina moderna", "Edificio con gimnasio"]
    }
  ],
  pricesData: [
    { year: 'Año 1', price: 10 },
    { year: 'Año 2', price: 20 },
    { year: 'Año 3', price: 30 },
    { year: 'Año 4', price: 40 },
    { year: 'Año 5', price: 50 },
  ],
  demandData: [
    { name: 'Barrio 1', value: 20 },
    { name: 'Barrio 2', value: 20 },
    { name: 'Barrio 3', value: 20 },
    { name: 'Barrio 4', value: 20 },
    { name: 'Barrio 5', value: 20 },
  ]
};

export default function App() {
  // Initialize state from LocalStorage if available to prevent data loss on refresh/new tab
  const [data, setData] = useState<ReportData>(() => {
      try {
          const saved = localStorage.getItem('reportData');
          return saved ? JSON.parse(saved) : INITIAL_DATA;
      } catch (e) {
          console.error("Error loading saved data", e);
          return INITIAL_DATA;
      }
  });
  
  const [template, setTemplate] = useState<ReportTemplate>(() => {
      const saved = localStorage.getItem('reportTemplate');
      return (saved as ReportTemplate) || 'classic';
  });

  const [showConfig, setShowConfig] = useState(true);
  
  // Persist data changes
  useEffect(() => {
      try {
        localStorage.setItem('reportData', JSON.stringify(data));
      } catch (e) { console.error("Error saving data", e); }
  }, [data]);

  useEffect(() => {
      localStorage.setItem('reportTemplate', template);
  }, [template]);

  // PDF Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [printFeedback, setPrintFeedback] = useState<{type: 'success' | 'info' | 'error', message: string} | null>(null);

  const componentRef = useRef<HTMLDivElement>(null);
  
  const openInNewTab = () => {
      window.open(window.location.href, '_blank');
  };

  const validateAndPrint = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setIsSuccess(false);
    setPdfError(null);
    setPrintFeedback(null);
    setProgress(10);
    setGenerationStatus('Iniciando validación de datos...');

    try {
        // Step 1: Data Integrity Validation
        await new Promise(r => setTimeout(r, 300)); 
        
        const errors: string[] = [];
        if (!data.companyName.trim()) errors.push("Nombre de la empresa");
        if (!data.agentName.trim()) errors.push("Nombre del agente");
        if (!data.properties || data.properties.length === 0) errors.push("Listado de propiedades (mínimo 1)");

        if (errors.length > 0) {
             throw new Error(`Validación fallida. Faltan los siguientes campos obligatorios: ${errors.join(", ")}.`);
        }
        setProgress(30);

        // Step 2: Asset Verification (Fonts & Images)
        setGenerationStatus('Verificando recursos gráficos...');
        
        // Ensure fonts are loaded (with timeout safety)
        try {
            await Promise.race([
                document.fonts.ready,
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout fonts")), 2000))
            ]);
        } catch (e) {
            console.warn("Advertencia: Las fuentes tardaron demasiado en cargar. El PDF se generará con las fuentes disponibles.");
        }
        setProgress(45);

        // Ensure images inside the report are loaded
        const reportElement = componentRef.current;
        if (reportElement) {
             const images = Array.from(reportElement.querySelectorAll('img')) as HTMLImageElement[];
             const totalImages = images.length;
             let loadedImages = 0;

             if (totalImages > 0) {
                 const imagePromises = images.map(img => {
                    if (img.complete && img.naturalHeight !== 0) {
                        loadedImages++;
                        setProgress(45 + Math.floor((loadedImages / totalImages) * 45));
                        return Promise.resolve();
                    }
                    return new Promise((resolve) => {
                        img.onload = () => {
                            loadedImages++;
                            setProgress(45 + Math.floor((loadedImages / totalImages) * 45));
                            resolve(null);
                        };
                        img.onerror = () => {
                            console.warn('Imagen falló al cargar:', img.src);
                            loadedImages++; // Count as processed even if failed
                            setProgress(45 + Math.floor((loadedImages / totalImages) * 45));
                            resolve(null);
                        };
                    });
                });
                
                // Timeout race to prevent hanging indefinitely
                const imageLoadPromise = Promise.all(imagePromises);
                const timeoutPromise = new Promise(resolve => setTimeout(resolve, 4000));
                await Promise.race([imageLoadPromise, timeoutPromise]);
             }
        }
        setProgress(100);
        setIsSuccess(true);
        setGenerationStatus('¡Validación correcta! Preparando documento...');
        
        // Show success message briefly
        await new Promise(r => setTimeout(r, 1000));

        // Close loading overlay explicitly BEFORE printing
        setIsGenerating(false);
        setIsSuccess(false);
        setGenerationStatus('');
        setProgress(0);
        
        // Slight delay to allow React to remove the overlay from DOM
        setTimeout(() => {
            if (typeof window.print === 'function') {
                // START DIAGNOSTIC LOGGING
                console.group('🖨️ Diagnóstico de Impresión');
                console.log('1. [App] Iniciando solicitud de impresión...');

                let beforePrintFired = false;

                const handleBeforePrint = () => {
                    beforePrintFired = true;
                    console.log('2. [Navegador] ✅ Evento `beforeprint` detectado: El diálogo de impresión se está abriendo.');
                };

                const handleAfterPrint = () => {
                    console.log('3. [Navegador] 🏁 Evento `afterprint` detectado: El ciclo de impresión ha finalizado.');
                    
                    if (beforePrintFired) {
                        console.log('ℹ️ [CONCLUSIÓN] El proceso técnico funcionó correctamente.');
                        console.log('   👉 Si se generó el PDF: El usuario confirmó la acción.');
                        console.log('   👉 Si NO se generó: El usuario presionó "Cancelar" o cerró el diálogo.');
                        console.log('   (Nota: Los navegadores no permiten al código saber qué botón pulsó por privacidad).');
                    } else {
                        console.error('❌ [ERROR] Se cerró el ciclo sin detectar la apertura del diálogo (`beforeprint`).');
                    }
                    console.groupEnd();
                    
                    // Cleanup listeners
                    window.removeEventListener('beforeprint', handleBeforePrint);
                    window.removeEventListener('afterprint', handleAfterPrint);
                };

                window.addEventListener('beforeprint', handleBeforePrint);
                window.addEventListener('afterprint', handleAfterPrint);

                try {
                    console.log('🚀 [App] Ejecutando window.print()...');
                    
                    // Prepare initial feedback
                    setPrintFeedback({
                        type: 'info',
                        message: "Solicitando impresión..."
                    });

                    window.print();
                    
                    // Check diagnosis after a short delay to catch "Ignored" or "Blocked" states
                    setTimeout(() => {
                         if (!beforePrintFired) {
                             console.error('❌ [DIAGNÓSTICO FINAL] El diálogo de impresión NO se abrió.');
                             console.warn('   🔍 CAUSA PROBABLE: El navegador o el entorno bloqueó la acción.');
                             
                             setPrintFeedback({
                                 type: 'error',
                                 message: "El navegador bloqueó la impresión. Por favor, abra en una nueva pestaña:"
                             });
                         } else {
                             // If it fired, we just assume it's pending user action or finished
                             setPrintFeedback({
                                type: 'success',
                                message: "Diálogo abierto. Si no ve el PDF, verifique si pulsó 'Cancelar' accidentalmente."
                            });
                         }
                    }, 1000);
                    
                } catch (err) {
                    console.error('❌ [Error Excepción] Falló window.print():', err);
                    setPrintFeedback({
                        type: 'error',
                        message: "Error técnico al iniciar la impresión."
                    });
                    console.groupEnd();
                }
            } else {
                console.error('❌ window.print no soportado.');
                setPdfError("Su navegador no soporta impresión automática. Use Ctrl+P.");
            }
        }, 500);

    } catch (e: any) {
        console.error('❌ Error durante la generación del reporte:', e);
        setPdfError(e.message || "Ocurrió un error inesperado al intentar generar el PDF.");
        setIsGenerating(false);
        setIsSuccess(false);
    }
  };

  const updateField = (field: keyof ReportData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
             const newLogo = reader.result as string;
             setData(prev => {
                 const currentSaved = prev.savedLogos || [];
                 // Prevent duplicates in library
                 const updatedSaved = currentSaved.includes(newLogo) 
                    ? currentSaved 
                    : [...currentSaved, newLogo];
                 
                 return {
                     ...prev,
                     logoImage: newLogo,
                     savedLogos: updatedSaved
                 };
             });
        };
        reader.readAsDataURL(file);
    }
  };

  const removeSavedLogo = (e: React.MouseEvent, logoToRemove: string) => {
      e.stopPropagation();
      setData(prev => {
          const newLogos = (prev.savedLogos || []).filter(l => l !== logoToRemove);
          const newSecondaries = (prev.secondaryLogos || []).filter(l => l !== logoToRemove);
          const isCurrent = prev.logoImage === logoToRemove;
          return {
              ...prev,
              savedLogos: newLogos,
              secondaryLogos: newSecondaries,
              // If we deleted the active logo, switch to the last available one or undefined
              logoImage: isCurrent 
                ? (newLogos.length > 0 ? newLogos[newLogos.length - 1] : undefined) 
                : prev.logoImage
          };
      });
  };

  const toggleSecondaryLogo = (e: React.MouseEvent, logo: string) => {
      e.stopPropagation();
      setData(prev => {
          const currentSecondaries = prev.secondaryLogos || [];
          const exists = currentSecondaries.includes(logo);
          
          let newSecondaries;
          if (exists) {
              newSecondaries = currentSecondaries.filter(l => l !== logo);
          } else {
              newSecondaries = [...currentSecondaries, logo];
          }
          
          return { ...prev, secondaryLogos: newSecondaries };
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
      
      {/* Loading/Success Overlay */}
      {isGenerating && (
          <div className="fixed inset-0 z-[60] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300 print:hidden">
              <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center max-w-sm w-full text-center relative overflow-hidden">
                  
                  {isSuccess ? (
                       <div className="mb-6 animate-in zoom-in duration-300">
                           <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                               <Check className="w-10 h-10 text-green-600" />
                           </div>
                       </div>
                  ) : (
                    <div className="relative mb-6">
                        <div className="w-16 h-16 border-4 border-purple-100 rounded-full"></div>
                        <div className="w-16 h-16 border-4 border-t-purple-600 rounded-full animate-spin absolute top-0 left-0"></div>
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-purple-800">{progress}%</span>
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {isSuccess ? '¡Completado!' : 'Generando PDF'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">{generationStatus}</p>
                  
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ease-out ${isSuccess ? 'bg-green-500' : 'bg-purple-600'}`} 
                        style={{ width: `${progress}%` }}
                      ></div>
                  </div>
              </div>
          </div>
      )}

      {/* LEFT SIDEBAR - CONFIGURATION */}
      <div className={`no-print bg-gray-50/50 border-r border-gray-200 shadow-xl z-20 transition-all duration-300 ${showConfig ? 'w-full md:w-96' : 'w-0 overflow-hidden'}`}>
        <div className="h-full overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-8 sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 py-2 border-b border-gray-200/50">
             <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="bg-gray-900 text-white p-2 rounded-lg shadow-md">
                    <Settings className="w-5 h-5" />
                </div>
                Configuración
             </h2>
             <button onClick={() => setShowConfig(false)} className="md:hidden text-gray-500 hover:text-gray-800">Close</button>
          </div>

          <div className="space-y-6">

             {/* Template Selection */}
             <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4" /> Plantilla
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    {(['classic', 'modern', 'minimal'] as ReportTemplate[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTemplate(t)}
                            className={`py-3 px-2 border rounded-xl text-xs font-semibold capitalize transition-all duration-200 flex flex-col items-center gap-2 ${
                                template === t 
                                ? 'border-purple-500 bg-purple-50 text-purple-700 ring-1 ring-purple-500 shadow-sm' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                            }`}
                        >
                            {/* Visual representation of template */}
                             <div className={`w-full h-8 rounded mb-1 ${
                                t === 'classic' ? 'bg-gray-200' : 
                                t === 'modern' ? 'bg-gray-800' : 'border border-gray-200'
                            }`}></div>
                            {t}
                        </button>
                    ))}
                </div>
            </section>
            
            {/* Branding - Enhanced UI */}
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group/card">
                 <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-blue-500 opacity-80"></div>
                <h3 className="text-sm font-bold text-gray-800 mb-5 flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600">
                        <Palette className="w-4 h-4" />
                    </div>
                    Branding Corporativo
                </h3>
                
                <div className="space-y-6">
                    {/* Brand Color */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Color de Marca</label>
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:scale-105 transition-transform ring-offset-2 focus-within:ring-2 ring-purple-500">
                                <input 
                                    type="color" 
                                    value={data.logoColor} 
                                    onChange={(e) => updateField('logoColor', e.target.value)} 
                                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0" 
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 focus-within:border-purple-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                                    <Hash className="w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        value={data.logoColor} 
                                        onChange={(e) => updateField('logoColor', e.target.value)} 
                                        className="w-full bg-transparent text-sm font-medium text-gray-700 outline-none uppercase font-mono" 
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logo Section */}
                    <div>
                        <div className="flex justify-between items-end mb-2">
                             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Logotipos</label>
                             <span className="text-[10px] text-gray-400">
                                {data.savedLogos?.length || 0} guardados
                             </span>
                        </div>
                        
                        {!data.logoImage && (!data.savedLogos || data.savedLogos.length === 0) ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 hover:border-purple-400 hover:text-purple-600 transition-all cursor-pointer group bg-gray-50/30">
                                <div className="p-3 bg-white shadow-sm rounded-full group-hover:shadow-md group-hover:scale-110 transition-all mb-2 text-gray-400 group-hover:text-purple-600">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-medium text-gray-600 group-hover:text-purple-700">Click para subir logo</span>
                                <span className="text-[10px] text-gray-400 mt-1">PNG, JPG (Max 2MB)</span>
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                            </label>
                        ) : (
                             <div className="space-y-4">
                                {/* Main Uploader Small */}
                                 <label className="flex items-center gap-2 justify-center w-full py-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-xs font-medium text-gray-600">
                                     <Upload className="w-3 h-3" /> Subir nuevo logo
                                     <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                 </label>

                                {/* Saved Logos Library */}
                                {data.savedLogos && data.savedLogos.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {data.savedLogos.map((logo, idx) => {
                                            const isPrimary = data.logoImage === logo;
                                            const isSecondary = data.secondaryLogos?.includes(logo);

                                            return (
                                                <div 
                                                    key={idx}
                                                    onClick={() => updateField('logoImage', logo)}
                                                    className={`relative aspect-square rounded-lg border cursor-pointer overflow-hidden group/thumb bg-white transition-all ${
                                                        isPrimary 
                                                        ? 'ring-2 ring-purple-500 border-transparent shadow-md' 
                                                        : isSecondary
                                                            ? 'ring-2 ring-blue-400 border-transparent shadow-sm'
                                                            : 'border-gray-200 hover:border-purple-300'
                                                    }`}
                                                >
                                                    <div className="w-full h-full p-2 flex items-center justify-center">
                                                        <img src={logo} alt={`Saved logo ${idx}`} className="max-w-full max-h-full object-contain" />
                                                    </div>
                                                    
                                                    {/* Status Badges */}
                                                    {isPrimary && <div className="absolute top-1 left-1 w-2 h-2 bg-purple-500 rounded-full ring-1 ring-white"></div>}
                                                    {isSecondary && !isPrimary && <div className="absolute top-1 left-1 w-2 h-2 bg-blue-400 rounded-full ring-1 ring-white"></div>}

                                                    {/* Controls Overlay */}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 backdrop-blur-[1px]">
                                                         <button 
                                                            onClick={(e) => toggleSecondaryLogo(e, logo)}
                                                            className={`p-1 rounded-full ${isSecondary ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'} hover:scale-110 transition-transform`}
                                                            title="Toggle Secondary"
                                                        >
                                                            {isSecondary ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                                        </button>
                                                        <button 
                                                            onClick={(e) => removeSavedLogo(e, logo)}
                                                            className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600 hover:scale-110 transition-transform"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <p className="text-[10px] text-gray-400 text-center">
                                    Click para seleccionar Principal. <br/> Botón (+) para añadir Secundarios.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Text Inputs */}
                    <div className="space-y-4 border-t border-gray-100 pt-4">
                        <div className="group">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 group-focus-within:text-purple-600 transition-colors">Nombre Empresa</label>
                            <input 
                                type="text" 
                                value={data.companyName} 
                                onChange={(e) => updateField('companyName', e.target.value)} 
                                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-700 font-medium focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300 outline-none transition-all placeholder:text-gray-300"
                                placeholder="Ej. Rimberio Real Estate"
                            />
                        </div>
                        <div className="group">
                             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 group-focus-within:text-purple-600 transition-colors">Agente Responsable</label>
                             <input 
                                type="text" 
                                value={data.agentName} 
                                onChange={(e) => updateField('agentName', e.target.value)} 
                                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-700 font-medium focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300 outline-none transition-all placeholder:text-gray-300"
                                placeholder="Ej. Sandra Haro"
                             />
                        </div>
                    </div>
                </div>
            </section>

             {/* Content */}
             <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Contenido del Reporte</h3>
                <div className="space-y-4">
                    <div>
                         <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha Reporte</label>
                         <input type="text" value={data.date} onChange={(e) => updateField('date', e.target.value)} className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all" />
                    </div>
                     <div>
                         <label className="block text-xs font-semibold text-gray-500 mb-1">Texto Introducción</label>
                         <textarea rows={4} value={data.introText} onChange={(e) => updateField('introText', e.target.value)} className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none resize-none transition-all" />
                    </div>
                </div>
            </section>

             {/* Verification Elements (Mock) */}
             <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Verificación</h3>
                <div className="flex items-center gap-3 text-sm text-gray-700 bg-green-50 border border-green-100 p-3 rounded-xl shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Firma Digital: Activada</span>
                </div>
            </section>

          </div>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col relative h-screen overflow-hidden bg-gray-200 print:h-auto print:overflow-visible print:bg-white print:block">
        
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm z-10 no-print">
            <div className="flex items-center gap-4">
                 {!showConfig && (
                    <button onClick={() => setShowConfig(true)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Settings className="w-5 h-5 text-gray-600" />
                    </button>
                 )}
                 <h1 className="text-lg font-bold text-gray-700 hidden sm:block tracking-tight">Editor de Reportes <span className="text-gray-400 font-normal text-sm ml-2">v1.0</span></h1>
            </div>
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={openInNewTab}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-all"
                    title="Abrir en nueva pestaña (evita bloqueos de impresión)"
                >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Nueva Pestaña</span>
                </button>

                <button 
                    onClick={() => console.log('Share Report action initiated')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-all"
                >
                    <Share2 className="w-4 h-4" />
                    <span>Compartir</span>
                </button>

                <button 
                    onClick={validateAndPrint}
                    disabled={isGenerating}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-lg transition-all font-medium text-sm active:scale-95 ${
                        isGenerating 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                    <span>{isGenerating ? 'Generando...' : 'Descargar PDF'}</span>
                </button>
            </div>
        </div>

        {/* Feedback Messages */}
        <div className="no-print">
            {/* Critical Error Banner */}
            {pdfError && (
                <div className="bg-red-50 border-b border-red-200 p-4 flex items-center justify-between text-red-700 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <span className="text-sm font-medium">{pdfError}</span>
                    </div>
                    <button onClick={() => setPdfError(null)} className="p-1 hover:bg-red-100 rounded-full">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            
            {/* Info/Success Feedback Banner */}
            {printFeedback && (
                <div className={`p-4 mx-4 mt-4 rounded-lg flex items-center justify-between animate-in slide-in-from-top-2 border shadow-sm ${
                    printFeedback.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 
                    printFeedback.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}>
                    <div className="flex items-center gap-3">
                        {printFeedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : 
                         printFeedback.type === 'error' ? <AlertTriangle className="w-5 h-5 flex-shrink-0" /> : <Info className="w-5 h-5 flex-shrink-0" />}
                        <span className="text-sm font-medium">{printFeedback.message}</span>
                    </div>
                    
                    {printFeedback.type === 'error' && (
                        <button 
                            onClick={openInNewTab}
                            className="ml-auto text-xs bg-white border border-red-200 hover:bg-red-50 text-red-700 px-3 py-1.5 rounded-md font-medium transition-colors shadow-sm"
                        >
                            Abrir en Nueva Pestaña
                        </button>
                    )}

                    <button onClick={() => setPrintFeedback(null)} className="p-1 hover:bg-black/5 rounded-full ml-2">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8 flex justify-center gap-8 custom-scrollbar print:overflow-visible print:p-0 print:block print:h-auto">
            {/* The Report Preview */}
            <div className="scale-[0.6] origin-top md:scale-[0.7] lg:scale-[0.85] xl:scale-100 transition-all duration-300 print:scale-100 print:w-full print:mx-auto print:transform-none">
                <ReportPreview data={data} template={template} ref={componentRef} />
            </div>
        </div>

      </div>
    </div>
  );
}