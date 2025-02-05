import { Context, Contract, Transaction } from 'fabric-contract-api';
import { createHash } from 'crypto'; // Node.js crypto Modul für Hashing


export class ElectionContract extends Contract {

        /**
     * Erstellt eine neue Wahl.
     * @param ctx - Der Transaktionskontext von Hyperledger Fabric
     * @param electionId - Die eindeutige ID der Wahl
     * @param candidates - Eine Liste der Kandidaten für die Wahl
     * @param startTime - Der Startzeitpunkt der Wahl (Unix-Zeitstempel in Millisekunden)
     * @param endTime - Der Endzeitpunkt der Wahl (Unix-Zeitstempel in Millisekunden)
     */
    @Transaction()
    async createElection(ctx: Context, electionId: string, candidates: string, startTime: number, endTime: number): Promise<void> {
        /* const callerIdentity = ctx.clientIdentity.getID();
        if (!callerIdentity.includes('admin')) {
            throw new Error('Nur Admins dürfen Wahlen erstellen.');
        } */
        const candidatesArray = candidates.split(',');


        const election = {
            electionId,
            candidatesArray,
            startTime,
            endTime,
            votes: {},
            voters: []
        };
        await ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));
    }

        /**
     * Gibt eine Stimme für eine Wahl ab.
     * @param ctx - Der Transaktionskontext von Hyperledger Fabric
     * @param electionId - Die ID der Wahl, für die abgestimmt wird
     * @param candidate - Der Kandidat, für den die Stimme abgegeben wird
     */
    @Transaction()
    async castVote(ctx: Context, electionId: string, candidate: string, caller: string): Promise<void> {
        // Wahlen abrufen
        const electionData = await ctx.stub.getState(electionId);
        
        if (!electionData || electionData.length === 0) {
            throw new Error('Wahl existiert nicht.');
        }
        const election = JSON.parse(electionData.toString());
        
        
        election.voters = Array.isArray(election.voters) ? election.voters : [];

        
        
        // **Caller-Identifikation hashen**
        const hashedCaller = createHash('sha256').update(caller).digest('hex');

        // Prüfen, ob der Benutzer bereits abgestimmt hat
        if (election.voters.includes(hashedCaller)) {
            throw new Error('Wähler hat bereits abgestimmt.');
        }
    
        
        const currentTime = Date.now();
        if (currentTime < election.startTime || currentTime > election.endTime) {
            throw new Error('Wahl ist nicht aktiv.');
        }
    
        
        if (!election.candidatesArray.includes(candidate)) {
            throw new Error('Ungültiger Kandidat.');
        }
        // TODO: Hier ist der nächste Fehler weil er den Kandidat nicht findet
    
        election.votes[candidate] = (election.votes[candidate] || 0) + 1;
        election.voters.push(hashedCaller);  // Füge den Wähler zu voters hinzu
        
        // Wahlen aktualisieren
        await ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));
    }

        /**
     * Ruft die Wahlergebnisse ab.
     * @param ctx - Der Transaktionskontext von Hyperledger Fabric
     * @param electionId - Die ID der Wahl, deren Ergebnisse abgerufen werden sollen
     * @returns Die Wahlergebnisse als JSON-String
     */
    @Transaction(false)
    async getElectionResults(ctx: Context, electionId: string): Promise<string> {
        const electionData = await ctx.stub.getState(electionId);
        if (!electionData || electionData.length === 0) {
            throw new Error('Wahl existiert nicht.');
        }
        return electionData.toString();
    }
}

//export default ElectionContract;
