const express = require('express');
const router = express.Router();
const waitersVotingController = require('./waiters-voting.controller');

router.post('/add', waitersVotingController.addRestaurantWaiterRating);
router.get('/', waitersVotingController.getWaitersVotes);
router.delete('/:id', waitersVotingController.deleteWaiterVote);


module.exports = router;
