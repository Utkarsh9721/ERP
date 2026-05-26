import pkg from "pg";
const {Pool}=pkg;

const pool=new Pool({
    user:"utkarsh",
    host:"localhost",
    database:"Authentication",
    password:"Utkarsha1#",
    port:5432,
});
pool.connect()
.then(()=>console.log("connect to psql"))
.catch((err)=>console.log("error db is not connecten"));
export default pool;
