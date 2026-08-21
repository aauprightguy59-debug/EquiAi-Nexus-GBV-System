import { Report, ResourceAllocation } from '../types';

export const INITIAL_REPORTS: Report[] = [
  {
    id: "rep-ussd-1",
    category: "GBV",
    targetUser: "women",
    description: "[USSD *384*55# in Tiv Language] Emergency distress alert flagged from rural Gbor District, Gboko. Survivor requested discreet callback and safe haven shelter. Husband seized identity papers and issued physical threats. Dialed via basic 2G feature phone without internet.",
    date: "2026-06-14T03:15:00.000Z",
    location: "Gbor District, Rural Gboko",
    reportedBy: "USSD Gateway",
    status: "Actioned",
    urgency: "Critical",
    cleaningLog: "USSD zero-data session processed. Caller MSISDN +234803****7721 sanitized and encrypted into confidential case file.",
    ussdMeta: {
      dialCode: "*384*55#",
      language: "tiv",
      rawPath: "2*1*1*1*1",
      needsCallback: true,
      ticketNumber: "USSD-4821"
    },
    assignedResource: {
      type: "Temporary Shelter",
      name: "GECN Safe Haven Gboko",
      contact: "+234 703 212 1178",
      status: "Dispatched"
    }
  },
  {
    id: "rep-ussd-2",
    category: "Land/property rights",
    targetUser: "girls",
    description: "[USSD *384*55# in Idoma Language] Property exclusion logged from Adoka Ward, Otukpo. Young female orphan barred from late parents' yam holdings by paternal uncles claiming customary male-only succession. Legal aid mediation requested via button phone.",
    date: "2026-06-13T18:45:00.000Z",
    location: "Adoka Ward, Otukpo",
    reportedBy: "USSD Gateway",
    status: "Referred",
    urgency: "High",
    cleaningLog: "Zero-data USSD session sanitized. Cell tower node tagged to Otukpo Adoka.",
    ussdMeta: {
      dialCode: "*384*55*3*2*2*3*3#",
      language: "idoma",
      rawPath: "3*2*2*3*3",
      needsCallback: false,
      ticketNumber: "USSD-9104"
    },
    assignedResource: {
      type: "Legal Aid",
      name: "Gwan & Chambers Legal Aid",
      contact: "+234 901 222 3434",
      status: "Completed"
    }
  },
  {
    id: "rep-1",
    category: "Land/property rights",
    targetUser: "girls",
    description: "A young daughter in Yandev Ward, Gboko, has been denied her deceased father's land sharing inheritance by traditional family elders who claim custom forbids female land ownership.",
    date: "2026-06-11T14:30:00.000Z",
    location: "Yandev Ward, Gboko West",
    reportedBy: "Community Advocate",
    status: "Classified",
    urgency: "Medium",
    cleaningLog: "Anonymized the survivor's family name and exact farm plot coordinates to prevent community backlash."
  },
  {
    id: "rep-2",
    category: "Economic Barrier",
    targetUser: "women",
    description: "Women cassava traders at the Gboko Main Market are facing extortions and illegal taxes from unofficial trade union enforcers. Those who refuse to pay are physically bared from setting up their stalls.",
    date: "2026-06-12T09:15:00.000Z",
    location: "Central Ward, Gboko",
    reportedBy: "Survivor",
    status: "Pending",
    urgency: "High"
  },
  {
    id: "rep-3",
    category: "GBV",
    targetUser: "GBV victims",
    description: "Severe domestic violence incident. Husband threatened life after dispute over family finances. Needs immediate temporary shelter and legal mediation support.",
    date: "2026-06-13T22:11:00.000Z",
    location: "Gboko South (Abagu Area)",
    reportedBy: "SMS Gateway",
    status: "Actioned",
    urgency: "Critical",
    smsContent: "HELP NEED SAFE PLACE in Abagu Gboko. Husband beat me up, locked house with key. I am hiding. Help.",
    cleaningLog: "Redacted phone number +2347031..., withheld exact street address, and substituted husband's name with [Spouse] for security.",
    assignedResource: {
      type: "Temporary Shelter",
      name: "GECN Safe Haven Gboko",
      contact: "+234 703 212 1178",
      status: "Dispatched"
    }
  },
  {
    id: "rep-4",
    category: "Healthcare Denial",
    targetUser: "sex workers",
    description: "Client was stigmatized and flatly refused basic reproductive health screening and HIV prophylaxis at a community health clinic in Adekaa after revealing her occupation.",
    date: "2026-06-13T11:00:00.000Z",
    location: "Adekaa Area, Gboko East",
    reportedBy: "Healthcare Worker",
    status: "Referred",
    urgency: "High",
    cleaningLog: "Removed explicit clinic identifier to keep report systemic, and redacted client's personal peer ID.",
    assignedResource: {
      type: "Medical Support",
      name: "Gboko General Hospital (Peer Wing)",
      contact: "+234 812 555 9090",
      status: "Completed"
    }
  },
  {
    id: "rep-5",
    category: "Education Barrier",
    targetUser: "girls",
    description: "Several teenage girls in Mkar district are being pulled out of senior high school classes to do commercial farm labor due to extreme economic hardship facing their parents.",
    date: "2026-06-14T01:45:00.000Z",
    location: "Mkar Ward, Gboko East",
    reportedBy: "Community Advocate",
    status: "Pending",
    urgency: "Medium"
  }
];

export const INITIAL_RESOURCES: ResourceAllocation[] = [
  {
    id: "res-1",
    name: "GECN Safe Haven Gboko",
    type: "Temporary Shelter",
    location: "Secret Location, Gboko South",
    contact: "+234 703 212 1178",
    status: "Available"
  },
  {
    id: "res-2",
    name: "Gboko General Hospital (Peer Wing)",
    type: "Medical Support",
    location: "Hospital Road, Gboko Central",
    contact: "+234 812 555 9090",
    status: "Available"
  },
  {
    id: "res-3",
    name: "Gwan & Chambers Legal Aid",
    type: "Legal Aid",
    location: "Ahmadu Bello Way, Gboko",
    contact: "+234 901 222 3434",
    status: "Available"
  },
  {
    id: "res-4",
    name: "GECN Counseling & Healing Circle",
    type: "Counseling",
    location: "No. 62 Ahmadu Bello Way, Gboko",
    contact: "+234 703 212 1178",
    status: "Available"
  },
  {
    id: "res-5",
    name: "A4HP Microfinance & Market Empowerment Club",
    type: "Economic Support",
    location: "No. 62 Ahmadu Bello Way, Gboko",
    contact: "+234 703 212 1178",
    status: "Available"
  }
];
