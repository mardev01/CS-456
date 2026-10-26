const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('crypto');
process.env.DB_HOST=`mongodb://127.0.0.1:27017/travlr_customer_test_${process.pid}`;
process.env.JWT_SECRET=crypto.randomBytes(48).toString('hex');
const app=require('../../app');
const {connect,mongoose}=require('../../app_api/models/db');
const Customer=require('../../app_api/models/customer');
const User=require('../../app_api/models/user');
const Trip=require('../../app_api/models/travlr');
const Reservation=require('../../app_api/models/reservation');
let server,base,alice,bob,staff,reservation;
const account=name=>({name,email:name.toLowerCase()+'@test.invalid',password:'CustomerPassword2027!',confirmPassword:'CustomerPassword2027!'});
const trip={code:'OCEAN',name:'Ocean Sample',length:'4 nights / 5 days',start:'2099-08-20',resort:'Blue Bay',perPerson:'999.00',image:'reef1.jpg',description:'<p>A sample trip.</p>'};
async function request(path,method='GET',body,token){
 const headers={'Content-Type':'application/json'};if(token)headers.Authorization='Bearer '+token;
 const response=await fetch(base+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
 const text=await response.text();return {status:response.status,body:text?JSON.parse(text):null};
}
test.before(async()=>{
 await connect();await Promise.all([Customer.init(),User.init(),Trip.init(),Reservation.init()]);
 await Trip.create(trip);await Trip.create({...trip,code:'MOUNTAIN',name:'Mountain Sample',resort:'Hill Lodge',perPerson:'2000'});
 const user=new User({name:'Staff',email:'staff@test.invalid'});await user.setPassword('StaffPassword2027!');await user.save();staff=user.generateJWT();
 server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 process.env.PORT=String(server.address().port);base=`http://127.0.0.1:${process.env.PORT}`;
});
test.after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));if(mongoose.connection.readyState)await mongoose.connection.dropDatabase();await mongoose.disconnect();});
test('public search filters by location and price and rejects bad ranges',async()=>{
 const result=await request('/api/trips?q=blue&maxPrice=1000');assert.equal(result.status,200);assert.equal(result.body.length,1);assert.equal(result.body[0].code,'OCEAN');
 assert.equal((await request('/api/trips?minPrice=20&maxPrice=10')).status,400);
 assert.equal((await request('/api/trips?minPrice=abc')).status,400);
});
test('customer signup validates confirmation, keeps hashes private, and prevents duplicate accounts',async()=>{
 assert.equal((await request('/api/customer/register','POST',{...account('Alice'),confirmPassword:'different'})).status,400);
 const a=await request('/api/customer/register','POST',account('Alice'));assert.equal(a.status,201);alice=a.body.token;assert.equal(a.body.customer.hash,undefined);
 const b=await request('/api/customer/register','POST',account('Bob'));assert.equal(b.status,201);bob=b.body.token;
 assert.equal((await request('/api/customer/register','POST',account('Alice'))).status,409);
 assert.equal(await User.countDocuments(),1);
 assert.equal((await request('/api/customer/login','POST',{email:account('Alice').email,password:'wrong'})).status,401);
 assert.equal((await request('/api/customer/login','POST',{email:account('Alice').email,password:account('Alice').password})).status,200);
});
test('customer and staff tokens cannot cross their authorization boundaries',async()=>{
 assert.equal((await request('/api/trips','POST',trip,alice)).status,401);
 assert.equal((await request('/api/customers','GET',undefined,alice)).status,401);
 assert.equal((await request('/api/reservations','GET',undefined,alice)).status,401);
 assert.equal((await request('/api/customer/reservations','GET',undefined,staff)).status,401);
 assert.equal((await request('/api/customer/reservations')).status,401);
});
test('reservation pricing comes from MongoDB and duplicate checkout does not create another booking',async()=>{
 const body={tripCode:'OCEAN',travelers:2,requestKey:'reservation-test-key-0001',totalCents:1,pricePerPersonCents:1};
 const result=await request('/api/customer/reservations','POST',body,alice);assert.equal(result.status,201);reservation=result.body;
 assert.equal(reservation.totalCents,199800);assert.equal(reservation.pricePerPersonCents,99900);
 assert.equal((await request('/api/customer/reservations','POST',body,alice)).status,200);
 assert.equal(await Reservation.countDocuments(),1);
 assert.equal((await request('/api/customer/reservations','POST',{...body,travelers:3},alice)).status,409);
 assert.equal((await request('/api/customer/reservations','POST',{...body,requestKey:'bad-quantity-0001',travelers:0},alice)).status,400);
});
test('customers can read and cancel only their own itinerary',async()=>{
 const path='/api/customer/reservations/'+reservation._id;
 assert.equal((await request(path,'GET',undefined,bob)).status,404);
 assert.equal((await request(path+'/cancel','PATCH',{},bob)).status,404);
 assert.equal((await request('/api/customer/reservations','GET',undefined,bob)).body.length,0);
 assert.equal((await request(path,'GET',undefined,alice)).body.reference,reservation.reference);
 assert.equal((await request(path+'/cancel','PATCH',{},alice)).body.status,'cancelled');
});
test('staff can manage customers and reservations without exposing password hashes',async()=>{
 const customers=await request('/api/customers','GET',undefined,staff);assert.equal(customers.status,200);assert.equal(customers.body.length,2);assert.equal(customers.body[0].hash,undefined);
 const id=customers.body.find(c=>c.name==='Alice')._id;
 assert.equal((await request('/api/customers/'+id,'PATCH',{active:false},staff)).body.active,false);
 assert.equal((await request('/api/customer/me','GET',undefined,alice)).status,401);
 assert.equal((await request('/api/customers/'+id,'PATCH',{active:true},staff)).body.active,true);
 assert.equal((await request('/api/reservations','GET',undefined,staff)).body[0].customer.name,'Alice');
 assert.equal((await request('/api/reservations/'+reservation._id,'PATCH',{status:'confirmed'},staff)).body.status,'confirmed');
 assert.equal((await request('/api/reservations/'+reservation._id,'PATCH',{status:'invalid'},staff)).status,400);
});
test('itineraries preserve the booked price and details after the trip changes or is removed',async()=>{
 await Trip.updateOne({code:'OCEAN'},{$set:{name:'Changed Trip',perPerson:'1200'}});
 const saved=await request('/api/customer/reservations/'+reservation._id,'GET',undefined,alice);
 assert.equal(saved.body.trip.name,'Ocean Sample');assert.equal(saved.body.totalCents,199800);
 await Trip.deleteOne({code:'OCEAN'});
 assert.equal((await request('/api/customer/reservations/'+reservation._id,'GET',undefined,alice)).status,200);
});
test('past trips cannot be reserved',async()=>{
 await Trip.create({...trip,code:'PAST',start:'2000-01-01'});
 assert.equal((await request('/api/customer/reservations','POST',{tripCode:'PAST',travelers:1,requestKey:'past-trip-checkout-0001'},alice)).status,400);
});
test('public forms reject missing CSRF tokens and redirects preserve protected checkout',async()=>{
 const page=await fetch(base+'/account/login');const html=await page.text();assert.ok(html.includes('name="_csrf"'));
 const rejected=await fetch(base+'/account/login',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Origin:base},body:'email=alice%40test.invalid&password=wrong'});assert.equal(rejected.status,403);
 const checkout=await fetch(base+'/checkout?tripCode=MOUNTAIN',{redirect:'manual'});assert.equal(checkout.status,302);assert.ok(checkout.headers.get('location').startsWith('/account/login?returnTo='));
 const csrf=/name="_csrf" value="([^"]+)"/.exec(html)[1];
 const cookie=page.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
 const authenticated=await fetch(base+'/account/login',{method:'POST',redirect:'manual',headers:{Origin:base,Cookie:cookie,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({_csrf:csrf,email:account('Alice').email,password:account('Alice').password,returnTo:'https://evil.invalid'})});
 assert.equal(authenticated.status,302);assert.equal(authenticated.headers.get('location'),'/reservations');assert.ok(authenticated.headers.getSetCookie().some(v=>v.includes('HttpOnly')&&v.includes('travlr_customer')));
});
