// Runs against its own temporary database; it never changes the normal travlr database.
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
process.env.DB_HOST = `mongodb://127.0.0.1:27017/travlr_test_${process.pid}`;
process.env.JWT_SECRET = crypto.randomBytes(48).toString('hex');
const app = require('../../app');
const { mongoose, connect } = require('../../app_api/models/db');
const Trip = require('../../app_api/models/travlr');
const User = require('../../app_api/models/user');
const jwt = require('jsonwebtoken');
let server, base, token, user;
const trip = { code: 'FINALTEST', name: 'Test Cove', length: '5 nights', start: '2027-07-15',
  resort: 'Test Resort', perPerson: '1299.00', image: 'reef2.jpg', description: '<p>A test trip.</p>' };
async function request(path, method = 'GET', body, auth) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers.Authorization = `Bearer ${auth}`;
  const response = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null, headers: response.headers };
}
test.before(async () => {
  await connect();
  await Promise.all([Trip.init(), User.init()]);
  user = new User({ name: 'Test Admin', email: 'admin@test.invalid' });
  await user.setPassword('TestPassword2027!'); await user.save();
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
test.after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  if (mongoose.connection.readyState) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
test('GET works publicly; POST, PUT, DELETE, and staff registration require authentication', async () => {
  assert.equal((await request('/trips')).status, 200);
  for (const [path,method] of [['/trips','POST'],['/trips/FINALTEST','PUT'],['/trips/FINALTEST','DELETE'],['/register','POST']]) {
    assert.equal((await request(path, method, trip)).status, 401);
  }
  assert.equal(await Trip.countDocuments(),0);
});
test('login rejects incorrect passwords and signs a one-hour JWT for the correct password', async () => {
  assert.equal((await request('/login','POST',{email:user.email,password:'wrong'})).status,401);
  const result=await request('/login','POST',{email:user.email,password:'TestPassword2027!'});
  assert.equal(result.status,200); token=result.body.token;
  const claims=jwt.verify(token,process.env.JWT_SECRET,{issuer:'travlr',audience:'travlr-admin'});
  assert.equal(claims.sub,user.id); assert.equal(claims.exp-claims.iat,3600);
  const stored=await User.findById(user.id).select('+hash +salt').lean();
  assert.notEqual(stored.hash,'TestPassword2027!'); assert.ok(stored.salt); assert.equal(stored.password,undefined);
});
test('tampered, expired, and deleted-user tokens are rejected',async()=>{
  assert.equal((await request('/trips','POST',trip,token.slice(0,-8)+'invalid!')).status,401);
  const expired=jwt.sign({},process.env.JWT_SECRET,{subject:user.id,expiresIn:-1,issuer:'travlr',audience:'travlr-admin'});
  assert.equal((await request('/trips','POST',trip,expired)).status,401);
  const unknown=jwt.sign({},process.env.JWT_SECRET,{subject:new mongoose.Types.ObjectId().toString(),expiresIn:60,issuer:'travlr',audience:'travlr-admin'});
  assert.equal((await request('/trips','POST',trip,unknown)).status,401);
});
test('authorized POST persists a trip, sanitizes HTML, and rejects duplicates and invalid values',async()=>{
  const result=await request('/trips','POST',{...trip,description:'<p>Safe</p><script>alert(1)</script><img src=x onerror=alert(1)>'},token);
  assert.equal(result.status,201); assert.ok(result.body.description.startsWith('<p>Safe</p>')); assert.ok(!result.body.description.includes('<script')); assert.ok(!result.body.description.includes('<img'));
  assert.equal((await request('/trips','POST',trip,token)).status,409);
  assert.equal((await request('/trips','POST',{...trip,code:'NEGATIVE',perPerson:'-5'},token)).status,400);
  assert.equal((await request('/trips','POST',{},token)).status,400);
  assert.equal((await request('/trips/FINALTEST')).body[0].name,trip.name);
});
test('authorized PUT persists changes and invalid updates leave the saved trip intact',async()=>{
  const updated={...trip,name:'Test Cove Deluxe',perPerson:'1399.00'};
  assert.equal((await request('/trips/FINALTEST','PUT',updated,token)).status,200);
  assert.equal((await Trip.findOne({code:trip.code})).name,updated.name);
  assert.equal((await request('/trips/FINALTEST','PUT',{...updated,perPerson:'-1'},token)).status,400);
  assert.equal((await request('/trips/FINALTEST')).body[0].perPerson,'1399.00');
  assert.equal((await request('/trips/MISSING','PUT',{...updated,code:'MISSING'},token)).status,404);
});
test('only an authenticated administrator can create another staff account',async()=>{
  const account={name:'Second Admin',email:'second@test.invalid',password:'AnotherPassword2027!'};
  assert.equal((await request('/register','POST',account,token)).status,201);
  assert.equal((await request('/register','POST',account,token)).status,409);
  assert.equal((await request('/register','POST',{...account,email:'third@test.invalid',password:'short'},token)).status,400);
});
test('DELETE removes only the selected trip and returns 404 when repeated',async()=>{
  await Trip.create({...trip,code:'KEEPTHIS'});
  assert.equal((await request('/trips/FINALTEST','DELETE',undefined,token)).status,204);
  assert.equal((await request('/trips/FINALTEST')).status,404);
  assert.equal((await request('/trips/FINALTEST','DELETE',undefined,token)).status,404);
  assert.equal(await Trip.countDocuments({code:'KEEPTHIS'}),1);
});
test('CORS permits the Angular origin and malformed JSON returns an API error',async()=>{
  const cors=await fetch(base+'/trips',{method:'OPTIONS',headers:{Origin:'http://localhost:4200','Access-Control-Request-Method':'PUT'}});
  assert.equal(cors.status,204);assert.equal(cors.headers.get('access-control-allow-origin'),'http://localhost:4200');
  const bad=await fetch(base+'/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{bad'});
  assert.equal(bad.status,400);assert.match(bad.headers.get('content-type'),/json/);
});
