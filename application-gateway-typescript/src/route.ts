
import { Router } from 'express';
import {createElection, castVote, getElectionResults} from './blockchainService';

const router = Router();

router.post('/createElection', async (req, res) => {
    try {
        const {election_id, options_parse, start_time_str, end_time_str} = req.body;
        const response = await createElection(election_id, options_parse, start_time_str, end_time_str);
        res.json(response);

    } catch(error) {
        res.status(500).json({error});
    }
});
    
router.post('/vote', async (req, res) => {
    try {
        const {election_id, selected_text, user_id} = req.body;
        const response = await castVote(election_id, selected_text, user_id);
        res.json(response);

    } catch(error) {
        res.status(500).json({error});
    }
});

router.get('/results/:electionId', async (req, res) => {
    try {
        const election_id = req.params.electionId;
        const response = await getElectionResults(election_id);
        res.json(response);

    } catch(error) {
        res.status(500).json({error});
    }
});


export default router;


