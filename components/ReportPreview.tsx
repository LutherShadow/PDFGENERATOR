import React from 'react';
import { ReportData, ReportTemplate } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface ReportPreviewProps {
  data: ReportData;
  template: ReportTemplate;
}

const COLORS = ['#8EB8B5', '#BDBAB5', '#6A908D', '#E5E7EB', '#4B5563'];

const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`w-[210mm] h-[297mm] bg-white shadow-lg mx-auto mb-8 relative overflow-hidden flex flex-col print:shadow-none print:mb-0 print:break-after-page print:w-full print:h-screen print:overflow-hidden ${className}`}>
    {children}
  </div>
);

// Helper to render Logo or Default Icon
const LogoRenderer: React.FC<{ data: ReportData; className?: string; style?: React.CSSProperties }> = ({ data, className, style }) => {
    if (data.logoImage) {
        return <img src={data.logoImage} alt="Company Logo" className={`object-contain ${className}`} style={style} />;
    }
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className} style={{color: data.logoColor, ...style}}>
            <path d="M3 21h18" />
            <path d="M5 21V7l8-4 8 4v14" />
            <path d="M9 10a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
            <path d="M12 14v7" />
        </svg>
    );
};

// Template Helper Components
const Footer: React.FC<{ data: ReportData, template: ReportTemplate }> = ({ data, template }) => {
    if (template === 'modern') {
        return (
            <div className="absolute bottom-0 w-full p-8 flex justify-between items-center text-xs text-gray-400 border-t border-gray-100">
                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        {data.logoImage && <img src={data.logoImage} alt="Logo" className="h-6 object-contain grayscale opacity-50" />}
                        {data.secondaryLogos?.map((logo, i) => (
                             <img key={i} src={logo} alt="Secondary Logo" className="h-5 object-contain grayscale opacity-40" />
                        ))}
                     </div>
                    <span className="font-bold tracking-widest text-gray-500">{data.companyName}</span>
                </div>
                <div className="flex gap-4">
                    <span>{data.agentName}</span>
                    <span className="text-gray-300">|</span>
                    <span>{data.website}</span>
                </div>
            </div>
        );
    }
    if (template === 'minimal') {
        return (
             <div className="absolute bottom-6 w-full text-center flex flex-col items-center justify-center gap-2">
                 <div className="flex items-center gap-3 opacity-30 justify-center">
                    {data.logoImage && <img src={data.logoImage} alt="Logo" className="h-4 object-contain grayscale" />}
                    {data.secondaryLogos?.map((logo, i) => (
                        <img key={i} src={logo} alt="Secondary Logo" className="h-3 object-contain grayscale" />
                    ))}
                 </div>
                <div className="text-[10px] text-gray-300 tracking-[0.2em] uppercase">
                    {data.companyName} — {data.website}
                </div>
            </div>
        );
    }
    // Classic
    return (
        <div className="absolute bottom-0 w-full h-12 bg-[#BDBAB5] text-white flex items-center justify-between px-12 text-sm font-medium z-10">
            <div className="flex items-center gap-3">
                {data.logoImage && <img src={data.logoImage} alt="Logo" className="h-8 w-8 object-contain bg-white rounded p-0.5" />}
                {data.secondaryLogos?.map((logo, i) => (
                     <img key={i} src={logo} alt="Secondary Logo" className="h-6 w-6 object-contain bg-white/50 rounded p-0.5 opacity-80" />
                ))}
                <span className="ml-2">Agente inmobiliario: {data.agentName}</span>
            </div>
            <span>{data.website}</span>
        </div>
    );
};

const HeaderStrip: React.FC<{ text: string; color: string; template: ReportTemplate }> = ({ text, color, template }) => {
    if (template === 'modern') {
        return (
            <div className="px-12 mt-12 mb-8">
                <h2 className="text-4xl font-bold text-gray-800 tracking-tight mb-2">{text}</h2>
                <div className="h-2 w-24" style={{ backgroundColor: color }}></div>
            </div>
        );
    }
    if (template === 'minimal') {
        return (
            <div className="px-12 mt-16 mb-12 flex items-center gap-4">
                 <div className="h-px bg-gray-300 flex-1"></div>
                 <h2 className="text-sm font-medium text-gray-500 tracking-[0.3em] uppercase">{text}</h2>
            </div>
        );
    }
    // Classic
    return (
        <div style={{ backgroundColor: color }} className="w-full py-4 px-12 mt-12 mb-8">
            <h2 className="text-2xl font-bold text-white tracking-wider uppercase">{text}</h2>
        </div>
    );
};

const CoverPage: React.FC<{ data: ReportData; template: ReportTemplate }> = ({ data, template }) => {
    if (template === 'modern') {
        return (
             <PageContainer>
                 <div className="absolute inset-0">
                    <img src={data.heroImage} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                 </div>
                 <div className="relative h-full flex flex-col justify-end p-16 pb-32">
                    <div className="border-l-8 pl-8" style={{ borderColor: data.logoColor }}>
                        <h1 className="text-7xl font-bold text-white mb-4 tracking-tighter">{data.reportTitle}</h1>
                        <p className="text-2xl text-gray-200 font-light">{data.subtitle}</p>
                    </div>
                    <div className="mt-12 text-white/80 flex justify-between items-end border-t border-white/20 pt-8">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                {data.logoImage && <img src={data.logoImage} className="h-12 w-12 object-contain bg-white/90 p-1 rounded" />}
                                <div>
                                    <p className="font-bold text-xl">{data.companyName}</p>
                                    <p>{data.date}</p>
                                </div>
                            </div>
                            {/* Secondary Logos Strip */}
                            {data.secondaryLogos && data.secondaryLogos.length > 0 && (
                                <div className="flex gap-3 mt-2">
                                     {data.secondaryLogos.map((logo, i) => (
                                         <img key={i} src={logo} className="h-8 object-contain bg-white/70 p-1 rounded opacity-80" />
                                     ))}
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm uppercase tracking-widest opacity-70">Agente</p>
                            <p className="text-xl">{data.agentName}</p>
                        </div>
                    </div>
                 </div>
             </PageContainer>
        );
    }
    
    if (template === 'minimal') {
        return (
            <PageContainer>
                <div className="flex-1 flex flex-col justify-center items-center p-20">
                    <div className="w-32 h-32 border border-gray-200 rounded-full flex items-center justify-center mb-12 overflow-hidden bg-gray-50">
                        <LogoRenderer data={data} className="w-16 h-16 text-gray-400" />
                    </div>
                    <h1 className="text-3xl font-light tracking-[0.5em] text-gray-800 uppercase text-center mb-4 leading-relaxed">
                        {data.reportTitle}
                    </h1>
                    <div className="w-12 h-px bg-gray-400 my-8"></div>
                    <p className="text-sm tracking-widest text-gray-500 uppercase">{data.subtitle}</p>
                    <p className="mt-2 text-xs text-gray-400">{data.date}</p>
                    
                    {/* Secondary Logos */}
                     {data.secondaryLogos && data.secondaryLogos.length > 0 && (
                        <div className="mt-16 flex gap-4 opacity-50">
                            {data.secondaryLogos.map((logo, i) => (
                                <img key={i} src={logo} className="h-8 object-contain grayscale" />
                            ))}
                        </div>
                    )}
                </div>
                 <div className="h-[300px] w-full p-20 pt-0">
                     <img src={data.heroImage} className="w-full h-full object-cover grayscale opacity-80" />
                 </div>
            </PageContainer>
        );
    }

    // Classic
    return (
        <PageContainer>
            <div className="flex-1 flex flex-col items-center justify-center pt-20">
                <div className="mb-6 h-24 flex items-center justify-center">
                    <LogoRenderer data={data} className="w-20 h-20" />
                </div>
                <h3 className="text-xl text-gray-600 mb-2">{data.companyName}</h3>
                <h1 className="text-6xl font-bold text-gray-800 mb-2 tracking-tight">REPORTE</h1>
                <div className="w-64 py-2 text-center mb-6" style={{backgroundColor: data.logoColor}}>
                    <span className="text-xl font-bold text-white uppercase tracking-widest">{data.subtitle}</span>
                </div>
                <p className="text-xl text-gray-600 mb-12">{data.date}</p>
                
                 {/* Secondary Logos */}
                 {data.secondaryLogos && data.secondaryLogos.length > 0 && (
                    <div className="mb-12 flex gap-4 items-center justify-center">
                        {data.secondaryLogos.map((logo, i) => (
                            <img key={i} src={logo} className="h-10 object-contain opacity-70" />
                        ))}
                    </div>
                )}
            </div>
            
            <div className="w-full h-[400px] overflow-hidden relative">
                <img src={data.heroImage} alt="Cover" className="w-full h-full object-cover" />
            </div>
            
            <Footer data={data} template={template} />
        </PageContainer>
    );
}

export const ReportPreview = React.forwardRef<HTMLDivElement, ReportPreviewProps>(({ data, template }, ref) => {
  return (
    <div ref={ref} className="print:w-full">
      
      {/* PAGE 1: COVER */}
      <CoverPage data={data} template={template} />

      {/* PAGE 2: INTRODUCTION & PRICE ANALYSIS */}
      <PageContainer>
        <HeaderStrip text="Introducción" color={data.logoColor} template={template} />
        <div className="px-12 text-gray-600 text-justify mb-8 leading-relaxed">
           {data.introText}
        </div>

        <HeaderStrip text="Análisis de Precios" color={data.logoColor} template={template} />
        <div className="px-12 mb-8 text-gray-600 text-justify leading-relaxed flex-1">
            <p className="mb-4">
                El precio promedio de las propiedades en la Ciudad de Alta Pinta ha aumentado en un 10% en los últimos dos años.
                El precio promedio por metro cuadrado es de $4.500.
            </p>
            <p className="mb-8">
                El siguiente gráfico muestra la tendencia de los precios de la propiedad en la ciudad en los últimos cinco años.
            </p>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.pricesData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={data.logoColor} stopOpacity={0.9}/>
                                <stop offset="95%" stopColor={data.logoColor} stopOpacity={0.4}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis 
                            dataKey="year" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#6B7280', fontSize: 12 }} 
                            dy={10}
                        />
                        <YAxis hide />
                        <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ 
                                borderRadius: '8px', 
                                border: 'none', 
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                backgroundColor: '#fff',
                                color: '#374151'
                            }}
                        />
                        <Bar 
                            dataKey="price" 
                            fill="url(#colorPrice)" 
                            radius={[6, 6, 0, 0]} 
                            barSize={50}
                            isAnimationActive={false} // IMPORTANT for printing
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="mt-4 text-sm text-gray-500">
                Como se puede observar en el gráfico, el precio de las propiedades ha experimentado un aumento constante en los últimos años.
            </p>
        </div>
        <Footer data={data} template={template} />
      </PageContainer>

      {/* PAGE 3: SUPPLY & DEMAND */}
      <PageContainer>
        <HeaderStrip text="Oferta y Demanda" color={data.logoColor} template={template} />
        <div className="px-12 text-gray-600 text-justify mb-8 leading-relaxed space-y-4">
           <p>La oferta de propiedades en la Ciudad de Alta Pinta es limitada debido a la falta de terrenos disponibles y a las regulaciones de construcción.</p>
           <p>La demanda de propiedades es alta debido a la creciente población y al aumento del poder adquisitivo. La mayoría de los compradores son jóvenes profesionales.</p>
        </div>

        <div className="px-12 flex flex-col items-center flex-1">
            <p className="mb-8 text-gray-600 w-full text-left">El siguiente gráfico muestra la distribución de la oferta de propiedades en la ciudad por barrio.</p>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <defs>
                            {data.demandData.map((entry, index) => (
                                <linearGradient key={`grad-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1}/>
                                    <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.7}/>
                                </linearGradient>
                            ))}
                        </defs>
                        <Pie
                            data={data.demandData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={105}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                            isAnimationActive={false} // IMPORTANT for printing
                        >
                            {data.demandData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`url(#pieGradient-${index})`} />
                            ))}
                        </Pie>
                        <Legend 
                            verticalAlign="bottom" 
                            height={36} 
                            iconType="circle"
                            formatter={(value) => <span className="text-gray-600 text-sm">{value}</span>}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                borderRadius: '8px', 
                                border: 'none', 
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                            itemStyle={{ color: '#374151' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
             <p className="mt-8 text-sm text-gray-500 w-full text-left">
                Como se puede observar en el gráfico, los barrios uno, dos y tres tienen la mayor oferta de propiedades en la ciudad.
            </p>
        </div>
        <Footer data={data} template={template} />
      </PageContainer>

      {/* PAGE 4: TRENDS & CONCLUSION */}
      <PageContainer>
        <HeaderStrip text="Tendencias del Mercado" color={data.logoColor} template={template} />
        <div className="px-12 mb-8">
            <h4 className="font-bold text-gray-700 mb-4">Las tendencias actuales del mercado inmobiliario incluyen:</h4>
            <div className="space-y-6 text-gray-600">
                <div className="flex gap-4">
                    <span className="font-bold text-xl text-gray-400">1.</span>
                    <p>{data.marketTrendText}</p>
                </div>
                <div className="flex gap-4">
                    <span className="font-bold text-xl text-gray-400">2.</span>
                    <p>Aumento de la inversión extranjera: La inversión extranjera ha aumentado debido a la estabilidad económica.</p>
                </div>
                 <div className="flex gap-4">
                    <span className="font-bold text-xl text-gray-400">3.</span>
                    <p>Mayor énfasis en la sustentabilidad: Los compradores buscan propiedades con sistemas de energía renovable.</p>
                </div>
            </div>
        </div>

        <HeaderStrip text="Conclusión" color={data.logoColor} template={template} />
        <div className="px-12 text-gray-600 text-justify leading-relaxed flex-1">
            {data.conclusionText}
        </div>
        <Footer data={data} template={template} />
      </PageContainer>

      {/* PAGE 5: LISTINGS */}
      <PageContainer>
        <HeaderStrip text="Propiedades Disponibles" color={data.logoColor} template={template} />
        <div className="px-12 space-y-8 flex-1">
            {data.properties.map((prop, idx) => (
                <div key={prop.id} className={`flex gap-6 items-start ${template === 'minimal' ? 'border-b pb-8' : 'bg-gray-50 p-4 rounded-lg'}`}>
                    <div className="w-48 h-32 flex-shrink-0 bg-gray-200 overflow-hidden rounded">
                        <img src={prop.image} alt={prop.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <h3 className={`font-bold text-gray-800 text-lg ${template === 'modern' ? 'text-2xl mb-1' : ''}`}>{prop.title}</h3>
                        <p className={`text-sm font-semibold mb-2 ${template === 'minimal' ? 'text-gray-400' : 'text-brand'}`} style={{color: template !== 'minimal' ? data.logoColor : undefined}}>{prop.address}</p>
                        <ul className="text-xs text-gray-600 space-y-1 mb-2 list-disc pl-4">
                            {prop.features.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                        <p className="font-bold text-gray-800 text-sm">Precio: {prop.price}</p>
                    </div>
                </div>
            ))}
        </div>
        <Footer data={data} template={template} />
      </PageContainer>

      {/* PAGE 6: BACK COVER */}
      <PageContainer>
        <div className="flex-1 flex flex-col items-center justify-center">
             <div className="flex flex-col items-center gap-6">
                <div className="h-32 flex items-center justify-center scale-150 text-gray-400">
                    <LogoRenderer data={data} className="w-20 h-20" style={{color: template === 'minimal' ? '#9CA3AF' : data.logoColor}} />
                </div>
                 {/* Secondary Logos */}
                 {data.secondaryLogos && data.secondaryLogos.length > 0 && (
                    <div className="flex gap-4 justify-center mt-4 border-t border-gray-100 pt-8 w-64">
                        {data.secondaryLogos.map((logo, i) => (
                            <img key={i} src={logo} className="h-12 object-contain grayscale opacity-50" />
                        ))}
                    </div>
                )}
            </div>
            
            <h3 className={`text-2xl mt-8 ${template === 'modern' ? 'font-bold tracking-tight' : 'font-light tracking-widest'} text-gray-600 mb-2`}>{data.companyName}</h3>
             {template === 'modern' && <p className="text-gray-400 mt-4">{data.website}</p>}
        </div>
        <Footer data={data} template={template} />
      </PageContainer>

    </div>
  );
});

ReportPreview.displayName = 'ReportPreview';