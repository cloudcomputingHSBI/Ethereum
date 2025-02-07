import { getPublicWallet } from "../api/apiService";
import { ethers } from "ethers";
import { getProvider, getVotingContract } from "../api/contracts";

/**
 * Funktion zur Ermittlung des Kandidaten-Index
 */
const findCandidateIndex = (formSchema: any[], selectedKey: string): number | null => {
  if (!Array.isArray(formSchema)) {
    console.error("Fehler: formSchema ist kein Array!", formSchema);
    return null;
  }

  for (const field of formSchema) {
    if (field.element === "RadioButtons") {
      const index = field.options.findIndex((option: any) => option.key === selectedKey);
      if (index !== -1) {
        return index;
      }
    }
  }
  return null;
};

/**
 * Abstimmungsfunktion mit Private Key als Parameter
 */
export const voteInElection = async (election: any, submittedData: any, privateKey: string) => {
  try {

  
    if (!privateKey) {
      console.error("Fehler: Kein Private Key übergeben!");
      return { success: false, error: "Private Key fehlt" };
    }

    const selectedKey = submittedData[0]?.value[0];
    if (!selectedKey) {
      console.error("Fehler: Kein Kandidat gewählt.");
      return { success: false, error: "Kein Kandidat gewählt" };
    }

    // Wallet-Adresse abrufen
    const walletAddress = await getPublicWallet();
    if (!walletAddress) {
      console.error("Wallet-Adresse konnte nicht abgerufen werden.");
      return { success: false, error: "Wallet-Adresse nicht abrufbar" };
    }

    // Wallet mit Private Key erstellen
    const provider = getProvider();
    const wallet = new ethers.Wallet(privateKey, provider);


    // Smart Contract Instanz holen
    const contract = getVotingContract(wallet);

    // Bestimme den Kandidaten-Index
    const formSchema = Array.isArray(election.form_schema) ? election.form_schema : [];
    const selectedCandidateIndex = findCandidateIndex(formSchema, selectedKey);

    if (selectedCandidateIndex === null) {
      console.error("Fehler: Der gewählte Kandidat konnte nicht gefunden werden.");
      return { success: false, error: "Kandidat nicht gefunden" };
    }

    // Transaktion senden
    console.log(`Stimme wird abgegeben für: ${selectedCandidateIndex}`);
    console.log(`Wahl-ID: ${election.blockchain_id}`);
    const tx = await contract.vote(election.blockchain_id, selectedCandidateIndex);
    await tx.wait();

    console.log(`Stimme erfolgreich abgegeben! TX-Hash: ${tx.hash}`);

    return { success: true, transactionHash: tx.hash };
  } catch (error) {
    console.error("Fehler bei der Abstimmung:", error);
    return { success: false, error };
  }
};
