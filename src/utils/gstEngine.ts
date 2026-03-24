/**
 * Autonomous GST Inference Engine based on CBIC taxonomy.
 * Matches common product/category names to standard Indian HSN Rental Service rules.
 * Most general rental services fallback to HSN 9973 with 18% GST.
 */

export interface GSTInfo {
  rate: number;
  hsn: string;
}

export function assignGSTRate(category: string, name: string): GSTInfo {
  const combinedStr = `${category} ${name}`.toLowerCase();

  // Books / Education Materials (Exempt)
  if (combinedStr.includes('book') || combinedStr.includes('textbook') || combinedStr.includes('notebook')) {
    return { rate: 0, hsn: '9973' }; // Leasing of exempt goods
  }

  // Medical Equipment (12%)
  if (
    combinedStr.includes('medical') || 
    combinedStr.includes('oxygen') || 
    combinedStr.includes('wheelchair') || 
    combinedStr.includes('hospital')
  ) {
    return { rate: 12, hsn: '9973' };
  }

  // Vehicles / Transport (28% or heavily taxed depending on scope, defaulting 28% for generic motor vehicles)
  if (
    combinedStr.includes('car') || 
    combinedStr.includes('bike') || 
    combinedStr.includes('vehicle') || 
    combinedStr.includes('suv') ||
    combinedStr.includes('motorcycle')
  ) {
    return { rate: 28, hsn: '9966' }; // Rental services of transport vehicles
  }

  // Apparel / Clothing (Usually 5% or 12%, defaulting 12% for rentals)
  if (
    combinedStr.includes('clothes') || 
    combinedStr.includes('apparel') || 
    combinedStr.includes('suit') || 
    combinedStr.includes('dress') ||
    combinedStr.includes('costume')
  ) {
    return { rate: 12, hsn: '9973' }; 
  }

  // Food Catering / Tents (Generally falls under 18% outdoor catering/rental, but equipment specifically might be 18%)
  // If specific catering food is somehow rented, it's 5%. We'll lean 18% for equipment.
  if (
    combinedStr.includes('tent') || 
    combinedStr.includes('catering') || 
    combinedStr.includes('event')
  ) {
    return { rate: 18, hsn: '9973' }; 
  }

  // Electronics / IT / Hardware / Cameras (Standard 18%)
  if (
    combinedStr.includes('electron') || 
    combinedStr.includes('camera') || 
    combinedStr.includes('lens') || 
    combinedStr.includes('laptop') || 
    combinedStr.includes('drone') ||
    combinedStr.includes('computer')
  ) {
    return { rate: 18, hsn: '9973' }; 
  }

  // Default fallback for "Rental Services of goods/machinery" is safely 18%
  return { rate: 18, hsn: '9973' };
}
