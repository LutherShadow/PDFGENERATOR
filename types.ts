
export interface Property {
  id: string;
  title: string;
  address: string;
  price: string;
  features: string[];
  image: string;
}

export interface ReportData {
  companyName: string;
  reportTitle: string;
  subtitle: string;
  date: string;
  agentName: string;
  website: string;
  heroImage: string;
  logoColor: string;
  logoImage?: string;
  secondaryLogos?: string[];
  savedLogos?: string[];
  introText: string;
  marketTrendText: string;
  conclusionText: string;
  properties: Property[];
  pricesData: { year: string; price: number }[];
  demandData: { name: string; value: number }[];
}

export type ReportTemplate = 'classic' | 'modern' | 'minimal';

export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT_2_3 = "2:3",
  LANDSCAPE_3_2 = "3:2",
  PORTRAIT_3_4 = "3:4",
  LANDSCAPE_4_3 = "4:3",
  PORTRAIT_9_16 = "9:16",
  LANDSCAPE_16_9 = "16:9",
  CINEMATIC_21_9 = "21:9",
}

export enum ImageSize {
  SIZE_1K = "1K",
  SIZE_2K = "2K",
  SIZE_4K = "4K",
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}