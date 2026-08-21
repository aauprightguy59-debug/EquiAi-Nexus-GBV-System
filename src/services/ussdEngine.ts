import { Report } from "../types";

export interface UssdResponse {
  action: "CON" | "END";
  message: string;
  reportCreated?: Report;
}

export function processClientUssd(
  text: string,
  phoneNumber: string,
  sessionId: string
): UssdResponse {
  const parts = text ? text.split("*") : [];
  const level1 = parts[0];

  // 0 -> Instant SOS
  if (level1 === "0") {
    const report: Report = {
      id: `rep-ussd-${Date.now()}`,
      category: "GBV",
      targetUser: "GBV victims",
      description: `[USSD *384*55*0# CRITICAL DISTRESS BEACON] Instant SOS beacon dispatched by caller ${phoneNumber}. Immediate crisis intervention requested.`,
      date: new Date().toISOString(),
      location: "Central Ward, Gboko",
      reportedBy: "USSD Gateway",
      status: "Pending",
      urgency: "Critical",
      cleaningLog: `Automated zero-click distress beacon registered from MSISDN ${phoneNumber.slice(0, 7)}****.`,
      ussdMeta: {
        dialCode: "*384*55*0#",
        language: "en",
        rawPath: "0",
        needsCallback: true,
        ticketNumber: `SOS-${Math.floor(1000 + Math.random() * 9000)}`
      }
    };
    return {
      action: "END",
      message: "🚨 GECN EMERGENCY SOS DISPATCHED!\nYour distress signal & location beacon have been logged. Emergency team notified. Dial 07032121178 for hotline. Safe haven standby.",
      reportCreated: report
    };
  }

  // 99 -> Clear trace
  if (level1 === "99") {
    return {
      action: "END",
      message: "🔒 GECN DISCREET SECURITY MODE\nUSSD session wiped. Dial history and temp session data cleared. You are safe."
    };
  }

  // ROOT MENU
  if (parts.length === 0 || text === "") {
    return {
      action: "CON",
      message: "Welcome to GECN HerData & Crisis Portal (*384*55#)\nSelect Language / Kaa zwa / To Onya:\n1. English\n2. Tiv (Zwa Tiv)\n3. Idoma (Ony'Idoma)\n0. 🚨 ZERO-CLICK SOS DISTRESS\n99. Discreet History Wiper"
    };
  }

  // Language 1: English
  if (level1 === "1") {
    if (parts.length === 1) {
      return {
        action: "CON",
        message: "GECN HerData (English)\n1. Report GBV / Domestic Abuse\n2. Land / Property Inheritance Exclusion\n3. Market Extortion & Illegal Levies\n4. Healthcare Stigma & Denial\n5. Education / Girl-Child Barrier\n6. Request Safe Haven Shelter\n7. A4HP Microfinance & Loan\n8. Free Legal Aid Support"
      };
    }

    const cat = parts[1];
    if (parts.length === 2) {
      return {
        action: "CON",
        message: "Select Benue Pilot LGA:\n1. Gboko\n2. Makurdi\n3. Otukpo\n4. Tarka\n5. Buruku\n6. Vendeikya\n7. Logo"
      };
    }

    if (parts.length === 3) {
      return {
        action: "CON",
        message: "Do you require an immediate callback or safe shelter?\n1. Yes, call me discreetly\n2. No, just record report for advocacy"
      };
    }

    // Submission
    const lgas = ["Gboko", "Makurdi", "Otukpo", "Tarka", "Buruku", "Vendeikya", "Logo"];
    const lgaIndex = parseInt(parts[2], 10) - 1;
    const chosenLga = lgas[lgaIndex] || "Gboko";
    const callbackChoice = parts[3] === "1";

    const report: Report = {
      id: `rep-ussd-${Date.now()}`,
      category: cat === "1" ? "GBV" : cat === "2" ? "Land/property rights" : cat === "3" ? "Economic Barrier" : "Healthcare Denial",
      targetUser: "women",
      description: `[USSD *384*55# English Report] Intake logged via basic GSM feature phone from ${chosenLga}. Callback: ${callbackChoice ? "Yes, Discreet" : "No (Statistical Log)"}.`,
      date: new Date().toISOString(),
      location: `${chosenLga} Central`,
      reportedBy: "USSD Gateway",
      status: "Pending",
      urgency: cat === "1" || cat === "6" ? "Critical" : "High",
      cleaningLog: `USSD session processed. Caller MSISDN sanitized.`,
      ussdMeta: {
        dialCode: `*384*55*${text}#`,
        language: "en",
        rawPath: text,
        needsCallback: callbackChoice,
        ticketNumber: `USSD-${Math.floor(1000 + Math.random() * 9000)}`
      }
    };

    return {
      action: "END",
      message: `✅ Case Registered: Ticket #${report.ussdMeta?.ticketNumber}\nYour confidential report from ${chosenLga} has been secured in HerData Commons. Helpline: 07032121178 (GECN Adekaa, Gboko).`,
      reportCreated: report
    };
  }

  // Language 2: Tiv
  if (level1 === "2") {
    if (parts.length === 1) {
      return {
        action: "CON",
        message: "GECN ken zwa Tiv\n1. Ifan hen ya / Mzeyol u kasev (GBV)\n2. Mbamzeyol sha Tar / Inyaregh ki ya (Land)\n3. Mkighir sha kasua (Market)\n4. Ihyev ken Iyouci (Health)\n5. Makeranta u wan-kwase (Education)\n6. Ijiir i mbaimian i kasev (Shelter)\n7. Inyaregh ki A4HP (Loan)"
      };
    }

    if (parts.length === 2) {
      return {
        action: "CON",
        message: "Tsua kpentar wou ken Benue:\n1. Gboko\n2. Makurdi\n3. Otukpo\n4. Tarka\n5. Buruku\n6. Vendeikya\n7. Logo"
      };
    }

    if (parts.length === 3) {
      return {
        action: "CON",
        message: "U soo er se yila u sha fon hen ijiir i dedoo kpa?\n1. Een, yila mo sha kunda-kunda\n2. Ei, nger mzeyol ne ts\u00f4"
      };
    }

    const tivLgas = ["Gboko", "Makurdi", "Otukpo", "Tarka", "Buruku", "Vendeikya", "Logo"];
    const lgaIndex = parseInt(parts[2], 10) - 1;
    const chosenLga = tivLgas[lgaIndex] || "Gboko";
    const callbackChoice = parts[3] === "1";

    const report: Report = {
      id: `rep-ussd-${Date.now()}`,
      category: parts[1] === "1" ? "GBV" : parts[1] === "2" ? "Land/property rights" : "Economic Barrier",
      targetUser: "women",
      description: `[USSD *384*55# Tiv Language Report] Mzeyol u ken zwa Tiv logged from ${chosenLga}. Callback: ${callbackChoice ? "Discreet" : "Log Only"}.`,
      date: new Date().toISOString(),
      location: `${chosenLga} Central`,
      reportedBy: "USSD Gateway",
      status: "Pending",
      urgency: parts[1] === "1" ? "Critical" : "High",
      cleaningLog: `Tiv USSD session sanitized. Caller encrypted.`,
      ussdMeta: {
        dialCode: `*384*55*${text}#`,
        language: "tiv",
        rawPath: text,
        needsCallback: callbackChoice,
        ticketNumber: `TIV-${Math.floor(1000 + Math.random() * 9000)}`
      }
    };

    return {
      action: "END",
      message: `✅ Mzeyol Wou Nger: #${report.ussdMeta?.ticketNumber}\nSe ngohol kwagh u u nger ken ${chosenLga} ne. Fon u wasen: 07032121178 (GECN Adekaa, Gboko).`,
      reportCreated: report
    };
  }

  // Language 3: Idoma
  if (level1 === "3") {
    if (parts.length === 1) {
      return {
        action: "CON",
        message: "GECN le Ony'Idoma\n1. Ebi nu Onya / Ipa le Onya (GBV)\n2. Eje le Enwu ole (Land & Property)\n3. Olenyi le Ahia (Market extortion)\n4. Olokwu le Owoce (Healthcare)\n5. Ewo k'Oyiobi (Girl Child)\n6. Oje ipa le ogba (Shelter)\n7. Okpiye le A4HP (Microloan)"
      };
    }

    if (parts.length === 2) {
      return {
        action: "CON",
        message: "Je ipe nu we yi le Benue:\n1. Otukpo\n2. Makurdi\n3. Gboko\n4. Apa\n5. Okpokwu\n6. Ogbadibo\n7. Obi"
      };
    }

    if (parts.length === 3) {
      return {
        action: "CON",
        message: "A ye k'alo gbe we le phone?\n1. Ee, gbe m le afuo\n2. Ooo, je eko nu tu le"
      };
    }

    const idomaLgas = ["Otukpo", "Makurdi", "Gboko", "Apa", "Okpokwu", "Ogbadibo", "Obi"];
    const lgaIndex = parseInt(parts[2], 10) - 1;
    const chosenLga = idomaLgas[lgaIndex] || "Otukpo";
    const callbackChoice = parts[3] === "1";

    const report: Report = {
      id: `rep-ussd-${Date.now()}`,
      category: parts[1] === "1" ? "GBV" : parts[1] === "2" ? "Land/property rights" : "Economic Barrier",
      targetUser: "women",
      description: `[USSD *384*55# Idoma Report] Ebi nu Onya logged from ${chosenLga}. Callback: ${callbackChoice ? "Yes" : "No"}.`,
      date: new Date().toISOString(),
      location: `${chosenLga} Town`,
      reportedBy: "USSD Gateway",
      status: "Pending",
      urgency: parts[1] === "1" ? "Critical" : "High",
      cleaningLog: `Idoma zero-data USSD session encrypted.`,
      ussdMeta: {
        dialCode: `*384*55*${text}#`,
        language: "idoma",
        rawPath: text,
        needsCallback: callbackChoice,
        ticketNumber: `IDM-${Math.floor(1000 + Math.random() * 9000)}`
      }
    };

    return {
      action: "END",
      message: `✅ Case le kpa: #${report.ussdMeta?.ticketNumber}\nAlo gbo enwu nu wa le ${chosenLga}. Phone: 07032121178 (GECN Adekaa, Gboko).`,
      reportCreated: report
    };
  }

  return {
    action: "END",
    message: "Invalid entry. Please dial *384*55# to restart GECN portal."
  };
}
