import bcrypt from "bcrypt";

const password="xqjvqkj3dx";
const hash="$2b$10$8afmRW6ilDb8SN5G2WCJg.sZfxHSKvlmO05.8fSeT3icd.W04lHz.";

if(bcrypt.compare(password,hash)){
  console.log("true");
}
else{
  console.log("false");
}
