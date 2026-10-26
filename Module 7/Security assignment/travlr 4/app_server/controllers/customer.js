const crypto=require('crypto');
const {api,setLogin,logout,safeReturn}=require('../middleware/customer-session');
const money=cents=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
const date=value=>new Date(value).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'});
const presentTrip=trip=>({...trip,priceCents:Math.round(Number(trip.perPerson)*100),dateLabel:date(trip.start),priceLabel:money(Math.round(Number(trip.perPerson)*100)),available:new Date(trip.start).getTime()>Date.now()});
const presentReservation=reservation=>({...reservation,id:String(reservation._id),dateLabel:date(reservation.trip.start),
  priceLabel:money(reservation.pricePerPersonCents),totalLabel:money(reservation.totalCents),
  confirmed:reservation.status==='confirmed',canCancel:reservation.status==='confirmed'&&new Date(reservation.trip.start).getTime()>Date.now()});
const loginForm=(req,res)=>res.render('customer-login',{title:'Customer sign in',returnTo:safeReturn(req.query.returnTo)});
const registerForm=(req,res)=>res.render('customer-register',{title:'Create an account',returnTo:safeReturn(req.query.returnTo)});
const signIn=async(req,res)=>{
  try{const result=await api('/customer/login','POST',{email:req.body.email,password:req.body.password});setLogin(res,result.token);res.redirect(safeReturn(req.body.returnTo));}
  catch(error){if(error.status>=500)throw error;res.status(error.status||400).render('customer-login',{title:'Customer sign in',error:error.message,email:req.body.email,returnTo:safeReturn(req.body.returnTo)});}
};
const signUp=async(req,res)=>{
  try{
    const result=await api('/customer/register','POST',{name:req.body.name,email:req.body.email,password:req.body.password,confirmPassword:req.body.confirmPassword});
    setLogin(res,result.token);res.redirect(safeReturn(req.body.returnTo));
  }catch(error){if(error.status>=500)throw error;res.status(error.status||400).render('customer-register',{title:'Create an account',error:error.message,name:req.body.name,email:req.body.email,returnTo:safeReturn(req.body.returnTo)});}
};
const signOut=(req,res)=>{logout(res);res.redirect('/');};
const profile=(req,res)=>res.render('customer-profile',{title:'My account'});
const checkout=async(req,res)=>{
  if(!req.query.tripCode)return res.render('message',{title:'Choose your next trip',message:'Browse the Travel page and choose a future trip to start your reservation.'});
  const [trip]=await api('/trips/'+encodeURIComponent(req.query.tripCode));
  res.render('checkout',{title:'Review your reservation',trip:presentTrip(trip),requestKey:crypto.randomUUID()});
};
const reserve=async(req,res)=>{
  try{
    const reservation=await api('/customer/reservations','POST',{tripCode:req.body.tripCode,travelers:Number(req.body.travelers),requestKey:req.body.requestKey},req.customerToken);
    res.redirect('/reservations/'+reservation._id+'?saved=1');
  }catch(error){if(error.status>=500)throw error;res.status(error.status||400).render('message',{title:'Reservation not completed',message:error.message});}
};
const reservations=async(req,res)=>res.render('reservations',{title:'My reservations',reservations:(await api('/customer/reservations','GET',undefined,req.customerToken)).map(presentReservation)});
const itinerary=async(req,res)=>{
  const reservation=await api('/customer/reservations/'+encodeURIComponent(req.params.reservationId),'GET',undefined,req.customerToken);
  res.render('itinerary',{title:'Your trip itinerary',reservation:presentReservation(reservation),saved:req.query.saved==='1'});
};
const cancel=async(req,res)=>{await api('/customer/reservations/'+encodeURIComponent(req.params.reservationId)+'/cancel','PATCH',{},req.customerToken);res.redirect('/reservations/'+req.params.reservationId);};
module.exports={loginForm,registerForm,signIn,signUp,signOut,profile,checkout,reserve,reservations,itinerary,cancel,presentTrip};
