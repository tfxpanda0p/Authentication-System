const router = require('express').Router();
const { getUserDate } = require('../controllers/userController');


router.get('/get-user-data', getUserDate);

module.exports = router;