export interface GoldenSetApiRow {
  prefId: number;
  olmid: string;
  employeeName: string;
  employeeRoll: string;
  employeeLevel: string;
  W1D1: string;
  W1D2: string;
  W1D3: string;
  W1D4: string;
  W1D5: string;
  W1D6: string;
  W1D7: string;
  W2D1: string;
  W2D2: string;
  W2D3: string;
  W2D4: string;
  W2D5: string;
  W2D6: string;
  W2D7: string;
  W3D1: string;
  W3D2: string;
  W3D3: string;
  W3D4: string;
  W3D5: string;
  W3D6: string;
  W3D7: string;
  W4D1: string;
  W4D2: string;
  W4D3: string;
  W4D4: string;
  W4D5: string;
  W4D6: string;
  W4D7: string;
  W5D1: string;
  W5D2: string;
  W5D3: string;
  W5D4: string;
  W5D5: string;
  W5D6: string;
  W5D7: string;
  W6D1: string;
  W6D2: string;
  W6D3: string;
  W6D4: string;
  W6D5: string;
  W6D6: string;
  W6D7: string;
}

export interface GoldenSetApiResponse {
  data: GoldenSetApiRow[];
}

export interface GoldenSetQueryParams {
  subDomainId: number | string;
}

/** Normalised flat row used by the grid */
export interface GoldenSetEmployee {
  prefId: number;
  olmid: string;
  name: string;
  role: string;
  level: string;
  /** 42-element array: index = week*7 + dayOfWeek (0-based) */
  shifts: string[];
}

/** Parsed summary stats per employee row */
export interface RowSummary {
  work: number;
  off: number;
  night: number;
  loadPct: number;
}
