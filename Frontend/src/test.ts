import * as fs from "fs";
import { Wallet } from "ethers";
import { saveForm, getElectionDetails, getElectionResults, getAccessibleElections } from "./api/apiService";
import { registerUser, loginUser } from "./api/authService";
import { setAuthToken } from "./api/index";
import { voteInElection } from "./api/voteService";
import { performance } from "perf_hooks"; // ⏱ Zeitmessung

const NUM_USERS = 2; // Anzahl der Benutzer
const PASSWORD = "Test1234!";
const EMAIL_PREFIX = "testuser";
const EMAIL_DOMAIN = "example.com";
const OUTPUT_FILE = "users.json";
const LOG_FILE = "output.log";

/**
 * 📌 Loggt eine Nachricht in die Datei `output.log`
 */
const logToFile = (message: string) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
};

/**
 * 📌 Funktion zur Benutzerregistrierung
 */
const registerUsers = async () => {
  logToFile(`🚀 Starte Registrierung von ${NUM_USERS} Benutzern...`);
  const users: { email: string; privateKey: string; walletAddress?: string }[] = [];

  for (let i = 1; i <= NUM_USERS; i++) {
    const email = `${EMAIL_PREFIX}${i}@${EMAIL_DOMAIN}`;
    const wallet = Wallet.createRandom();
    const publicKey = wallet.address;
    const privateKey = wallet.privateKey;

    const userData = {
      firstName: "Test",
      lastName: "User",
      email,
      password: PASSWORD,
      mrzData: { block1: "L7MW6RWXZ7", block2: "0404066", block3: "2806066", block4: "2108", block5: "3" },
      publicKey,
    };

    try {
      if (typeof registerUser === "function") {
        const response = await registerUser(userData);
        if (response?.walletAddress) {
          users.push({ email, privateKey, walletAddress: response.walletAddress });
        }
      }
    } catch (error) {
      logToFile(`❌ Fehler bei Benutzer ${i}: ${error}`);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(users, null, 2));
  logToFile(`📂 Private Keys gespeichert in ${OUTPUT_FILE}`);
};

/**
 * 📌 Funktion zum Einloggen des ersten Benutzers
 */
const loginFirstUser = async () => {
  try {
    const users = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
    if (users.length === 0) throw new Error("❌ Keine Benutzer gefunden!");

    const firstUser = users[0];

    const startTime = performance.now();
    const loginResponse = await loginUser({ email: firstUser.email, password: PASSWORD });
    const endTime = performance.now();

    if (!loginResponse?.token) {
      throw new Error("❌ Kein Token erhalten!");
    }

    setAuthToken(loginResponse.token);
    logToFile(`✅ Login erfolgreich! Token gespeichert.`);
    logToFile(`⏱ Login-Dauer: ${(endTime - startTime).toFixed(2)} ms`);
  } catch (error) {
    logToFile(`❌ Fehler beim Login: ${error}`);
  }
};

/**
 * 📌 Funktion zur Wahl-Erstellung
 */
const createElection = async () => {
  try {
    const electionData = {
      name: "Test-Wahl",
      description: "Automatisch erstellte Testwahl.",
      formData: [
        {
          id: "D2E71644-EC87-47A8-8470-B7FD4C260E3E",
          element: "RadioButtons",
          text: "Multiple Choice",
          required: false,
          field_name: "radiobuttons_80C42CBC-1C4D-46FC-A06C-C23BF9DD30CE",
          options: [
            { value: "ver453ver", text: "ver345ver", key: "radiobuttons_option_673066CE-83AE-4DAB-96B7-2542E39B6959" },
            { value: "erv", text: "erv", key: "radiobuttons_option_3BC8549B-CD4C-4F45-A6D2-9D046A1FAF24" },
            { value: "place_holder_option_3", text: "Place holder option 3", key: "radiobuttons_option_90044391-1C7C-4737-9B00-56DC32C17E2B" }
          ],
          dirty: false
        }
      ],
      startdate: new Date(),
      enddate: new Date(Date.now() + 25 * 60 * 1000),
      accessType: "open" as "open" | "restricted",
    };

    const startTime = performance.now();
    const response: any = await saveForm(
      electionData.name,
      electionData.description,
      electionData.formData,
      electionData.startdate,
      electionData.enddate,
      electionData.accessType
    );

    const endTime = performance.now();

    logToFile(`✅ Wahl erfolgreich erstellt!`);
    logToFile(`⏱ Wahl-Erstellungs-Dauer: ${(endTime - startTime).toFixed(2)} ms`);

    return response.election.election_id;
  } catch (error) {
    logToFile(`❌ Fehler bei der Wahlerstellung: ${error}`);
    return null;
  }
};

/**
 * 📌 Funktion zum Abstimmen mit vollständigem `Election`-Objekt
 */
const voteAllUsers = async (electionId: number) => {
  const users = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
  if (!users.length) return logToFile("❌ Keine Benutzer für Abstimmung gefunden!");

  const election = await getElectionDetails(electionId);
  if (!election) return logToFile("❌ Wahl-Details konnten nicht geladen werden!");

  const startTime = performance.now();
  const votingPromises = users.map(async (user: any) => {
    const selectedOption = [
      {
        id: "F5457BDB-33D8-4AC7-8CDC-8DF83A94E86A",
        name: "radiobuttons_D5DFBB02-0E5B-457B-9E07-0E881109E285",
        value: ["radiobuttons_option_3BC8549B-CD4C-4F45-A6D2-9D046A1FAF24"]
      }
    ];
    return await voteInElection(election, selectedOption, user.privateKey);
  });

  await Promise.all(votingPromises);
  const endTime = performance.now();

  logToFile(`✅ Alle ${users.length} Benutzer haben abgestimmt.`);
  logToFile(`⏱ Durchschnittliche Abstimmungslatenz: ${(endTime - startTime) / users.length} ms`);
};

/**
 * 📌 Funktion zur Ergebnisabfrage
 */
const fetchElectionResults = async (electionId: number) => {
  const results = await getElectionResults(electionId);
  logToFile(`📊 Wahlergebnisse: ${JSON.stringify(results, null, 2)}`);
};

/**
 * 📌 Hauptfunktion zur Testausführung
 */
const runTest = async () => {
  fs.writeFileSync(LOG_FILE, ""); // 🧹 Log-Datei leeren

  const totalStart = performance.now();

  await registerUsers();
  await loginFirstUser();

  const electionId = await createElection();
  if (!electionId) return logToFile("❌ Wahl-Erstellung fehlgeschlagen!");

  await voteAllUsers(electionId);
  await fetchElectionResults(electionId);

  const totalEnd = performance.now();
  logToFile(`🏁 Test abgeschlossen.`);
  logToFile(`⏱ Gesamtzeit des Tests: ${(totalEnd - totalStart).toFixed(2)} ms`);
};

// 📌 Skript starten
runTest().catch(console.error);
