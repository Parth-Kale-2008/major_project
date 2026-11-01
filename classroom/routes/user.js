const express = require("express");
const router = express.Router();


router.get("/",(req,res)=>{
    res.send("get for users");
});

//show-users
router.get("/:id",(req,res)=>{
    res.send("get for show users");
});

//post 
router.post("/",(req,res)=>{
    res.send("post for users");
});

//similarly we can make for delete 

router.delete("/:id",(req,res)=>{
    res.send("post deleted");
});

module.exports = router;