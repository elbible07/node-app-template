const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// Team routes (authentication is handled in server.js)
router.post('/', teamController.createTeam);
router.get('/', teamController.getAllTeams);
router.get('/my-teams', teamController.getMyTeams);

// Routes with path parameters
router.get('/:teamId', teamController.getTeamById);
router.post('/:teamId/join', teamController.joinTeam);
router.delete('/:teamId/leave', teamController.leaveTeam);
router.get('/:teamId/members', teamController.getTeamMembers);
router.get('/:teamId/membership', teamController.checkTeamMembership);

module.exports = router;