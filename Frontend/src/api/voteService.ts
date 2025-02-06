import { getPublicWallet } from "../api/apiService";
import { ethers } from "ethers";
import { getProvider, getVotingContract } from "../api/contracts";

// Funktion zur Ermittlung des Kandidaten-Index
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

// Abstimmungsfunktion
export const voteInElection = async (election: any, submittedData: any) => {
    try {
      const selectedKey = submittedData[0]?.value[0];
      if (!selectedKey) {
        alert("Bitte wählen Sie einen Kandidaten aus.");
        return;
      }
  
      // Nutzer nach Private Key fragen
      const privateKey = prompt("Bitte geben Sie Ihren privaten Schlüssel ein:");
      if (!privateKey) {
        alert("Privater Schlüssel benötigt!");
        return;
      }
  
      // Wallet-Adresse abrufen
      const walletAddress = await getPublicWallet();
      if (!walletAddress) {
        alert("Wallet-Adresse konnte nicht abgerufen werden.");
        return;
      }
  
  
      // Wallet mit Private Key erstellen (verwende `getProvider()` aus contracts.ts)
      const provider = getProvider();
      const wallet = new ethers.Wallet(privateKey, provider);
  
      if (wallet.address !== walletAddress) {
        alert("Der eingegebene Private Key stimmt nicht mit der gespeicherten Wallet überein.");
        return;
      }
  
      // Smart Contract Instanz holen (verwende `getVotingContract()` aus contracts.ts)
      const contract = getVotingContract(wallet);
  
      // Bestimme den Kandidaten-Index
      const formSchema = Array.isArray(election.form_schema) ? election.form_schema : [];
      const selectedCandidateIndex = findCandidateIndex(formSchema, selectedKey);
  
      if (selectedCandidateIndex === null) {
        alert("Fehler: Der gewählte Kandidat konnte nicht gefunden werden.");
        return;
      }
  
      // Transaktion senden
      const tx = await contract.vote(election.blockchain_id, selectedCandidateIndex);
      await tx.wait();
  
      alert("Ihre Stimme wurde erfolgreich abgegeben!");
  
      return { success: true, transactionHash: tx.hash };
    } catch (error) {
      console.error("Fehler bei der Abstimmung:", error);
      alert("Es gab ein Problem bei der Abstimmung.");
      return { success: false, error };
    }
  };