// check if transferTrnId has valid number of references
// transferTrnId should have only one reference
trns = db.users["J1ZlaKxb1rWHSQheuyuVXngYpAo1"].trns
Object.keys(trns).filter(t => trns[t].transferTrnId).forEach(tt => {
    refs = Object.keys(trns).filter(t1 => trns[t1].transferTrnId == tt)
    if (refs.length > 1) { 
       console.log(`${tt} has ${refs.length} references`)
    } else if (!refs) {
       console.log(`${tt} has no references`)
    }
})
